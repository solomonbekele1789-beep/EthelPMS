using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Settings.Application.Abstractions;
using NGO.PMS.Settings.Application.DTOs;

namespace NGO.PMS.Settings.Application.AlertThresholds.Queries.GetAlertThresholds;

public class GetAlertThresholdsQueryHandler : IRequestHandler<GetAlertThresholdsQuery, List<AlertThresholdDto>>
{
    private readonly ISettingsDbContext _db;
    private readonly IMapper _mapper;

    public GetAlertThresholdsQueryHandler(ISettingsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<AlertThresholdDto>> Handle(GetAlertThresholdsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.AlertThresholds.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Module))
            query = query.Where(t => t.Module == request.Module);

        return await query
            .OrderBy(t => t.Module)
            .ThenBy(t => t.MetricName)
            .ProjectTo<AlertThresholdDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
