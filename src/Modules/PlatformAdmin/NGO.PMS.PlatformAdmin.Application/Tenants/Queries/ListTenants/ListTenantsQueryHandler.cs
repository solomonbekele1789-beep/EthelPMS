using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;
using NGO.PMS.SharedKernel.Api;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Queries.ListTenants;

public class ListTenantsQueryHandler : IRequestHandler<ListTenantsQuery, PagedResponse<TenantListItemDto>>
{
    private readonly IPlatformDbContext _db;
    private readonly IMapper _mapper;

    public ListTenantsQueryHandler(IPlatformDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PagedResponse<TenantListItemDto>> Handle(ListTenantsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Tenants
            .Include(t => t.SubscriptionPackage)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLowerInvariant();
            query = query.Where(t =>
                t.Name.ToLower().Contains(search) ||
                t.Slug.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
            query = query.Where(t => t.Status == request.Status);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<TenantListItemDto>>(items);

        return PagedResponse<TenantListItemDto>.Ok(dtos, request.Page, request.PageSize, totalCount);
    }
}
