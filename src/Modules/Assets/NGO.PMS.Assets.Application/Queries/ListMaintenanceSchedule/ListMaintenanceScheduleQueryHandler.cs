using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Application.DTOs;

namespace NGO.PMS.Assets.Application.Queries.ListMaintenanceSchedule;

public sealed class ListMaintenanceScheduleQueryHandler : IRequestHandler<ListMaintenanceScheduleQuery, List<AssetMaintenanceDto>>
{
    private readonly IAssetsDbContext _db;
    private readonly IMapper _mapper;

    public ListMaintenanceScheduleQueryHandler(IAssetsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<AssetMaintenanceDto>> Handle(ListMaintenanceScheduleQuery request, CancellationToken ct)
    {
        var query = _db.AssetMaintenances.AsQueryable();

        if (request.AssetId.HasValue)
            query = query.Where(m => m.AssetId == request.AssetId.Value);

        if (request.IsCompleted.HasValue)
            query = query.Where(m => m.IsCompleted == request.IsCompleted.Value);

        return await query
            .OrderByDescending(m => m.ScheduledDate)
            .ProjectTo<AssetMaintenanceDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
