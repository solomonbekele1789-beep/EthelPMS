using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Domain.Events;

public sealed record FundRestrictionReleasedEvent(Guid FundRestrictionId, decimal AmountReleased) : IDomainEvent;
