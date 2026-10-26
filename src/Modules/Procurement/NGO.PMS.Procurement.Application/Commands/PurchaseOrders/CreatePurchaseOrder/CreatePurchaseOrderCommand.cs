using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseOrders.CreatePurchaseOrder;

public sealed record CreatePurchaseOrderCommand(
    string ReferenceNumber,
    Guid PurchaseRequestId,
    Guid SupplierId,
    Guid? RfqResponseId,
    DateTime? ExpectedDeliveryDate,
    string? PaymentTerms) : IRequest<Guid>;
