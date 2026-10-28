using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Dashboards.Application.Abstractions;
using NGO.PMS.Dashboards.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Dashboards.Application.Queries.GetDashboards;

public sealed class GetDashboardsQueryHandler : IRequestHandler<GetDashboardsQuery, List<DashboardSummaryDto>>
{
    private readonly IDashboardsDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public GetDashboardsQueryHandler(IDashboardsDbContext db, IMapper mapper, ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<List<DashboardSummaryDto>> Handle(GetDashboardsQuery request, CancellationToken cancellationToken)
    {
        var dashboards = await _db.DashboardConfigs
            .AsNoTracking()
            .Include(d => d.Widgets)
            .Where(d => d.OrganizationId == _currentUser.OrganizationId)
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<DashboardSummaryDto>>(dashboards);
    }
}
