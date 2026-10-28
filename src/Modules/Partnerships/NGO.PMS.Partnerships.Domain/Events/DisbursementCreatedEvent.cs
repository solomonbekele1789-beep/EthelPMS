using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Partnerships.Domain.Events;

public sealed record DisbursementCreatedEvent(Guid DisbursementId, Guid SubGranteeId, decimal Amount, string Currency) : IDomainEvent;
