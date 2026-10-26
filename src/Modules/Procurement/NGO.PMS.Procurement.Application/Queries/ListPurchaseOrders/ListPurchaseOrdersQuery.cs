using MediatR;
using NGO.PMS.Procurement.Application.DTOs;

namespace NGO.PMS.Procurement.Application.Queries.ListPurchaseOrders;

public sealed record ListPurchaseOrdersQuery(
    Guid? SupplierId,
    string? Status,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<PurchaseOrderDto>>;
