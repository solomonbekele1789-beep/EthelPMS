using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.CashBank.Application.Abstractions;
using NGO.PMS.CashBank.Domain.Entities;
using NGO.PMS.CashBank.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.CashBank.Application.Commands.Reconciliations;

public sealed record StartBankReconciliationCommand(
    Guid BankAccountId,
    DateTime StatementDate,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    decimal StatementEndingBalance,
    string? Notes = null) : IRequest<Guid>;

public sealed class StartBankReconciliationCommandValidator : AbstractValidator<StartBankReconciliationCommand>
{
    public StartBankReconciliationCommandValidator()
    {
        RuleFor(x => x.BankAccountId).NotEmpty();
        RuleFor(x => x.PeriodEnd).GreaterThanOrEqualTo(x => x.PeriodStart);
    }
}

public sealed class StartBankReconciliationCommandHandler : IRequestHandler<StartBankReconciliationCommand, Guid>
{
    private readonly ICashBankDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public StartBankReconciliationCommandHandler(ICashBankDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(StartBankReconciliationCommand request, CancellationToken cancellationToken)
    {
        var account = await _db.BankAccounts.FirstOrDefaultAsync(x => x.Id == request.BankAccountId, cancellationToken)
            ?? throw new KeyNotFoundException($"Bank account {request.BankAccountId} not found.");

        var reconciliation = BankReconciliation.Create(
            request.BankAccountId,
            request.StatementDate,
            request.PeriodStart,
            request.PeriodEnd,
            request.StatementEndingBalance,
            account.CurrentBalance,
            _currentUser.OrganizationId,
            request.Notes);

        _db.BankReconciliations.Add(reconciliation);
        await _db.SaveChangesAsync(cancellationToken);
        return reconciliation.Id;
    }
}

public sealed record CompleteBankReconciliationCommand(
    Guid ReconciliationId,
    IReadOnlyList<Guid> ClearedTransactionIds,
    string? Notes = null) : IRequest;

public sealed class CompleteBankReconciliationCommandHandler : IRequestHandler<CompleteBankReconciliationCommand>
{
    private readonly ICashBankDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CompleteBankReconciliationCommandHandler(ICashBankDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(CompleteBankReconciliationCommand request, CancellationToken cancellationToken)
    {
        var rec = await _db.BankReconciliations.FirstOrDefaultAsync(x => x.Id == request.ReconciliationId, cancellationToken)
            ?? throw new KeyNotFoundException($"Bank reconciliation {request.ReconciliationId} not found.");

        if (request.ClearedTransactionIds.Count > 0)
        {
            var transactions = await _db.CashTransactions
                .Where(t => t.BankAccountId == rec.BankAccountId
                            && t.Status == CashTransactionStatus.Posted
                            && request.ClearedTransactionIds.Contains(t.Id))
                .ToListAsync(cancellationToken);

            foreach (var tx in transactions)
            {
                tx.MarkReconciled(rec.Id);
                _db.BankReconciliationItems.Add(BankReconciliationItem.Create(
                    rec.Id,
                    tx.Id,
                    tx.TransactionDate,
                    tx.Description,
                    tx.GetSignedBalanceDelta(),
                    _currentUser.OrganizationId,
                    true,
                    tx.ReferenceNumber));
            }
        }

        rec.Complete(request.Notes);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
