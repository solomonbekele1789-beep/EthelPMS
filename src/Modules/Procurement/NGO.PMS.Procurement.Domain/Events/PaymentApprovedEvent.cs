using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Events;

public sealed record PaymentApprovedEvent(Guid PaymentRequestId, decimal Amount) : IDomainEvent;
