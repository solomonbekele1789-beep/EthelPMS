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

        if (!string.IsNullOrWhiteSpace(request.OfficeType))
        {
            var targetType = request.OfficeType.Trim();
            query = query.Where(o => o.OfficeType == targetType);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(o => o.Name.ToLower().Contains(search)
                                  || o.Code.ToLower().Contains(search)
                                  || (o.LocationAddress != null && o.LocationAddress.ToLower().Contains(search))
                                  || (o.Description != null && o.Description.ToLower().Contains(search)));
        }

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
            o.Id,
            o.Name,
            o.Code,
            o.OfficeType,
            o.Description,
            o.LocationAddress,
            o.Latitude,
            o.Longitude,
            o.IsActive,
            o.ParentOfficeId,
            o.ParentOffice?.Name,
            o.ParentOffice?.Code,
            userCounts.GetValueOrDefault(o.Id, 0),
            o.CreatedAt)).ToList();

        return PagedResponse<OfficeListItemDto>.Ok(items, request.Page, request.PageSize, total);
    }
}
