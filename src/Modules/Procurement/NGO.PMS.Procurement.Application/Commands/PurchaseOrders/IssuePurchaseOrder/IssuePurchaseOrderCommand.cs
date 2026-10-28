using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseOrders.IssuePurchaseOrder;

public sealed record IssuePurchaseOrderCommand(Guid PurchaseOrderId) : IRequest<Unit>;
