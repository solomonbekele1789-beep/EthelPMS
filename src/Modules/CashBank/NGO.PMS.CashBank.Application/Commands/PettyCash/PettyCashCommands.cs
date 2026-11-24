using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.CashBank.Application.Abstractions;
using NGO.PMS.CashBank.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.CashBank.Application.Commands.PettyCash;

public sealed record CreatePettyCashFundCommand(
    string Code,
    string Name,
    Guid CustodianUserId,
    Guid BankAccountId,
    string CurrencyCode,
    decimal ImprestLimit,
    decimal ReplenishmentThreshold,
    Guid? OfficeId = null) : IRequest<Guid>;

public sealed class CreatePettyCashFundCommandValidator : AbstractValidator<CreatePettyCashFundCommand>
{
    public CreatePettyCashFundCommandValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CustodianUserId).NotEmpty();
        RuleFor(x => x.BankAccountId).NotEmpty();
        RuleFor(x => x.CurrencyCode).NotEmpty().Length(3);
        RuleFor(x => x.ImprestLimit).GreaterThan(0);
        RuleFor(x => x.ReplenishmentThreshold).GreaterThanOrEqualTo(0).LessThanOrEqualTo(x => x.ImprestLimit);
    }
}

public sealed class CreatePettyCashFundCommandHandler : IRequestHandler<CreatePettyCashFundCommand, Guid>
{
    private readonly ICashBankDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreatePettyCashFundCommandHandler(ICashBankDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreatePettyCashFundCommand request, CancellationToken cancellationToken)
    {
        var fund = PettyCashFund.Create(
            request.Code,
            request.Name,
            request.CustodianUserId,
            request.BankAccountId,
            request.CurrencyCode,
            request.ImprestLimit,
            request.ReplenishmentThreshold,
            _currentUser.OrganizationId,
            request.OfficeId);

        _db.PettyCashFunds.Add(fund);
        await _db.SaveChangesAsync(cancellationToken);
        return fund.Id;
    }
}

public sealed record ReplenishPettyCashCommand(Guid FundId, decimal Amount) : IRequest;

public sealed class ReplenishPettyCashCommandValidator : AbstractValidator<ReplenishPettyCashCommand>
{
    public ReplenishPettyCashCommandValidator()
    {
        RuleFor(x => x.FundId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
    }
}

public sealed class ReplenishPettyCashCommandHandler : IRequestHandler<ReplenishPettyCashCommand>
{
    private readonly ICashBankDbContext _db;

    public ReplenishPettyCashCommandHandler(ICashBankDbContext db) => _db = db;

    public async Task Handle(ReplenishPettyCashCommand request, CancellationToken cancellationToken)
    {
        var fund = await _db.PettyCashFunds.FirstOrDefaultAsync(x => x.Id == request.FundId, cancellationToken)
            ?? throw new KeyNotFoundException($"Petty cash fund {request.FundId} not found.");

        fund.Replenish(request.Amount);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
