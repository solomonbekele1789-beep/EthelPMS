using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Events;

public sealed record GoodsReceivedEvent(Guid GrnId, Guid PurchaseOrderId) : IDomainEvent;
