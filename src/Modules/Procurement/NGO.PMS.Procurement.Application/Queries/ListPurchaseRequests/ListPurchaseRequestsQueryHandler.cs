using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Application.DTOs;
using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Application.Queries.ListPurchaseRequests;

public sealed class ListPurchaseRequestsQueryHandler : IRequestHandler<ListPurchaseRequestsQuery, PagedResult<PurchaseRequestDto>>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public ListPurchaseRequestsQueryHandler(IProcurementDbContext db, ICurrentUserService currentUser, IMapper mapper)
    { _db = db; _currentUser = currentUser; _mapper = mapper; }

    public async Task<PagedResult<PurchaseRequestDto>> Handle(ListPurchaseRequestsQuery request, CancellationToken ct)
    {
        var query = _db.PurchaseRequests
            .AsNoTracking()
            .Where(pr => pr.OrganizationId == _currentUser.OrganizationId);

        if (request.ProjectId.HasValue)
            query = query.Where(pr => pr.ProjectId == request.ProjectId.Value);

        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<ProcurementStatus>(request.Status, out var status))
            query = query.Where(pr => pr.Status == status);

        var totalCount = await query.CountAsync(ct);

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : request.PageSize;

        var items = await query
            .OrderByDescending(pr => pr.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<PurchaseRequestDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);

        return new PagedResult<PurchaseRequestDto>(items, totalCount, page, pageSize);
    }
}
