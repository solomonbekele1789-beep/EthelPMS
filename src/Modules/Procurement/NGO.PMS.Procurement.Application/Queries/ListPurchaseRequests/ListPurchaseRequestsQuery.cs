using MediatR;
using NGO.PMS.Procurement.Application.DTOs;

namespace NGO.PMS.Procurement.Application.Queries.ListPurchaseRequests;

public sealed record ListPurchaseRequestsQuery(
    Guid? ProjectId,
    string? Status,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<PurchaseRequestDto>>;
