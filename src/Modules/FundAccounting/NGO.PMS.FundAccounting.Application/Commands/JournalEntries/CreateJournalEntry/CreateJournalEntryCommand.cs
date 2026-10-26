using MediatR;

namespace NGO.PMS.FundAccounting.Application.Commands.JournalEntries.CreateJournalEntry;

public sealed record JournalLineInput(
    Guid AccountId,
    decimal DebitAmount,
    decimal CreditAmount,
    string? Description,
    Guid? FundCodeId);

public sealed record CreateJournalEntryCommand(
    string ReferenceNumber,
    string Description,
    DateTime TransactionDate,
    Guid? ProjectId,
    Guid? FundCodeId,
    string? Memo,
    List<JournalLineInput> Lines) : IRequest<Guid>;
