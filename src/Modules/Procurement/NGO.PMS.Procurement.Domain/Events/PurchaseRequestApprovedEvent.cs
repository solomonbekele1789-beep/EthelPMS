using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Events;

public sealed record PurchaseRequestApprovedEvent(Guid RequestId, Guid ProjectId) : IDomainEvent;
