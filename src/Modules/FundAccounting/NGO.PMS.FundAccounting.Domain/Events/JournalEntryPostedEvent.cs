using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Domain.Events;

public sealed record JournalEntryPostedEvent(Guid JournalEntryId, decimal TotalAmount) : IDomainEvent;
