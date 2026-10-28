using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application.Offices.DTOs;
using NGO.PMS.SharedKernel.Api;

namespace NGO.PMS.Identity.Application.Offices.Queries.ListOffices;

public class ListOfficesQueryHandler : IRequestHandler<ListOfficesQuery, PagedResponse<OfficeListItemDto>>
{
    private readonly IIdentityDbContext _db;
    public ListOfficesQueryHandler(IIdentityDbContext db) => _db = db;

    public async Task<PagedResponse<OfficeListItemDto>> Handle(ListOfficesQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Offices.Include(o => o.ParentOffice).AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(o => o.Name.ToLower().Contains(request.Search.ToLower())
                                  || o.Code.ToLower().Contains(request.Search.ToLower()));

        var total = await query.CountAsync(cancellationToken);
        var offices = await query.OrderBy(o => o.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var officeIds = offices.Select(o => o.Id).ToList();
        var userCounts = await _db.Users
            .Where(u => u.OfficeId.HasValue && officeIds.Contains(u.OfficeId.Value))
            .GroupBy(u => u.OfficeId!.Value)
            .Select(g => new { OfficeId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.OfficeId, x => x.Count, cancellationToken);

        var items = offices.Select(o => new OfficeListItemDto(
            o.Id, o.Name, o.Code,
            o.ParentOffice?.Name,
            userCounts.GetValueOrDefault(o.Id, 0))).ToList();

        return PagedResponse<OfficeListItemDto>.Ok(items, request.Page, request.PageSize, total);
    }
}
