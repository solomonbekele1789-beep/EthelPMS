using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Dashboards.Application.Abstractions;
using NGO.PMS.Dashboards.Application.DTOs;

namespace NGO.PMS.Dashboards.Application.Queries.GetDashboardWidgets;

public sealed class GetDashboardWidgetsQueryHandler : IRequestHandler<GetDashboardWidgetsQuery, List<DashboardWidgetDto>>
{
    private readonly IDashboardsDbContext _db;
    private readonly IMapper _mapper;

    public GetDashboardWidgetsQueryHandler(IDashboardsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<DashboardWidgetDto>> Handle(GetDashboardWidgetsQuery request, CancellationToken cancellationToken)
    {
        var widgets = await _db.DashboardWidgets
            .AsNoTracking()
            .Where(w => w.DashboardConfigId == request.DashboardConfigId)
            .OrderBy(w => w.Position)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<DashboardWidgetDto>>(widgets);
    }
}
