using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Events;

public sealed record PurchaseOrderIssuedEvent(Guid PurchaseOrderId, Guid SupplierId, decimal TotalAmount) : IDomainEvent;
