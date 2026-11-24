using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.CashBank.Application.Abstractions;
using NGO.PMS.CashBank.Domain.Entities;
using NGO.PMS.CashBank.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.CashBank.Application.Commands.Transactions;

public sealed record CreateCashTransactionCommand(
    string VoucherNumber,
    Guid BankAccountId,
    DateTime TransactionDate,
    CashTransactionType TransactionType,
    decimal Amount,
    string CurrencyCode,
    decimal ExchangeRate,
    string PayeeOrPayer,
    string Description,
    string? ReferenceNumber = null,
    Guid? ProjectId = null,
    Guid? FundCodeId = null,
    Guid? PaymentRequestId = null) : IRequest<Guid>;

public sealed class CreateCashTransactionCommandValidator : AbstractValidator<CreateCashTransactionCommand>
{
    public CreateCashTransactionCommandValidator()
    {
        RuleFor(x => x.VoucherNumber).NotEmpty().MaximumLength(60);
        RuleFor(x => x.BankAccountId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.ExchangeRate).GreaterThan(0);
        RuleFor(x => x.CurrencyCode).NotEmpty().Length(3);
        RuleFor(x => x.PayeeOrPayer).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
    }
}

public sealed class CreateCashTransactionCommandHandler : IRequestHandler<CreateCashTransactionCommand, Guid>
{
    private readonly ICashBankDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateCashTransactionCommandHandler(ICashBankDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateCashTransactionCommand request, CancellationToken cancellationToken)
    {
        var accountExists = await _db.BankAccounts.AnyAsync(x => x.Id == request.BankAccountId && x.IsActive, cancellationToken);
        if (!accountExists)
            throw new KeyNotFoundException($"Active bank account {request.BankAccountId} not found.");

        var tx = CashTransaction.Create(
            request.VoucherNumber,
            request.BankAccountId,
            request.TransactionDate,
            request.TransactionType,
            request.Amount,
            request.CurrencyCode,
            request.ExchangeRate,
            request.PayeeOrPayer,
            request.Description,
            _currentUser.OrganizationId,
            request.ReferenceNumber,
            request.ProjectId,
            request.FundCodeId,
            request.PaymentRequestId);

        _db.CashTransactions.Add(tx);
        await _db.SaveChangesAsync(cancellationToken);
        return tx.Id;
    }
}

public sealed record ApproveCashTransactionCommand(Guid Id) : IRequest;

public sealed class ApproveCashTransactionCommandHandler : IRequestHandler<ApproveCashTransactionCommand>
{
    private readonly ICashBankDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ApproveCashTransactionCommandHandler(ICashBankDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(ApproveCashTransactionCommand request, CancellationToken cancellationToken)
    {
        var tx = await _db.CashTransactions.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Cash transaction {request.Id} not found.");

        tx.Approve(_currentUser.UserId);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

public sealed record PostCashTransactionCommand(Guid Id) : IRequest;

public sealed class PostCashTransactionCommandHandler : IRequestHandler<PostCashTransactionCommand>
{
    private readonly ICashBankDbContext _db;

    public PostCashTransactionCommandHandler(ICashBankDbContext db) => _db = db;

    public async Task Handle(PostCashTransactionCommand request, CancellationToken cancellationToken)
    {
        var tx = await _db.CashTransactions.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Cash transaction {request.Id} not found.");

        var account = await _db.BankAccounts.FirstOrDefaultAsync(x => x.Id == tx.BankAccountId, cancellationToken)
            ?? throw new KeyNotFoundException($"Bank account {tx.BankAccountId} not found.");

        tx.Post();
        account.ApplyBalanceDelta(tx.GetSignedBalanceDelta());
        await _db.SaveChangesAsync(cancellationToken);
    }
}

public sealed record VoidCashTransactionCommand(Guid Id) : IRequest;

public sealed class VoidCashTransactionCommandHandler : IRequestHandler<VoidCashTransactionCommand>
{
    private readonly ICashBankDbContext _db;

    public VoidCashTransactionCommandHandler(ICashBankDbContext db) => _db = db;

    public async Task Handle(VoidCashTransactionCommand request, CancellationToken cancellationToken)
    {
        var tx = await _db.CashTransactions.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Cash transaction {request.Id} not found.");

        var wasPosted = tx.Status == CashTransactionStatus.Posted;
        tx.Void();

        if (wasPosted)
        {
            var account = await _db.BankAccounts.FirstOrDefaultAsync(x => x.Id == tx.BankAccountId, cancellationToken);
            account?.ApplyBalanceDelta(-tx.GetSignedBalanceDelta());
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}
