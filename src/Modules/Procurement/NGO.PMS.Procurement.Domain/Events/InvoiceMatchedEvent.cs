using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Events;

public sealed record InvoiceMatchedEvent(Guid InvoiceId, Guid PurchaseOrderId, MatchingStatus Status) : IDomainEvent;
