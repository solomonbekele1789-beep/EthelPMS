using MediatR;
using NGO.PMS.Procurement.Application.DTOs;

namespace NGO.PMS.Procurement.Application.Queries.GetPurchaseOrder;

public sealed record GetPurchaseOrderQuery(Guid PurchaseOrderId) : IRequest<PurchaseOrderDto>;
