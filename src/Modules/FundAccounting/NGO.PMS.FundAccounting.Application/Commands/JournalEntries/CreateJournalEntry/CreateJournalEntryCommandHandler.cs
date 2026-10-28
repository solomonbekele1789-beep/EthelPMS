using MediatR;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.FundAccounting.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Application.Commands.JournalEntries.CreateJournalEntry;

public sealed class CreateJournalEntryCommandHandler
    : IRequestHandler<CreateJournalEntryCommand, Guid>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateJournalEntryCommandHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(
        CreateJournalEntryCommand request,
        CancellationToken cancellationToken)
    {
        var entry = JournalEntry.Create(
            request.ReferenceNumber,
            request.Description,
            request.TransactionDate,
            _currentUser.OrganizationId);

        foreach (var line in request.Lines)
        {
            entry.AddLine(
                line.AccountId,
                line.DebitAmount,
                line.CreditAmount,
                line.Description,
                line.FundCodeId);
        }

        _db.JournalEntries.Add(entry);
        await _db.SaveChangesAsync(cancellationToken);

        return entry.Id;
    }
}
