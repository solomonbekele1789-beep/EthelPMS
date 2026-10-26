using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Application.DTOs;
using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Application.Queries.ListPurchaseOrders;

public sealed class ListPurchaseOrdersQueryHandler : IRequestHandler<ListPurchaseOrdersQuery, PagedResult<PurchaseOrderDto>>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public ListPurchaseOrdersQueryHandler(IProcurementDbContext db, ICurrentUserService currentUser, IMapper mapper)
    { _db = db; _currentUser = currentUser; _mapper = mapper; }

    public async Task<PagedResult<PurchaseOrderDto>> Handle(ListPurchaseOrdersQuery request, CancellationToken ct)
    {
        var query = _db.PurchaseOrders
            .AsNoTracking()
            .Where(po => po.OrganizationId == _currentUser.OrganizationId);

        if (request.SupplierId.HasValue)
            query = query.Where(po => po.SupplierId == request.SupplierId.Value);

        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<PurchaseOrderStatus>(request.Status, out var status))
            query = query.Where(po => po.Status == status);

        var totalCount = await query.CountAsync(ct);

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : request.PageSize;

        var items = await query
            .OrderByDescending(po => po.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<PurchaseOrderDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);

        return new PagedResult<PurchaseOrderDto>(items, totalCount, page, pageSize);
    }
}
