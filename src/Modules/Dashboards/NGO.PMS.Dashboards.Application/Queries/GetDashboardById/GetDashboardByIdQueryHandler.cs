using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Dashboards.Application.Abstractions;
using NGO.PMS.Dashboards.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Dashboards.Application.Queries.GetDashboardById;

public sealed class GetDashboardByIdQueryHandler : IRequestHandler<GetDashboardByIdQuery, DashboardConfigDto>
{
    private readonly IDashboardsDbContext _db;
    private readonly IMapper _mapper;

    public GetDashboardByIdQueryHandler(IDashboardsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<DashboardConfigDto> Handle(GetDashboardByIdQuery request, CancellationToken cancellationToken)
    {
        var dashboard = await _db.DashboardConfigs
            .AsNoTracking()
            .Include(d => d.Widgets)
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("DashboardConfig", request.Id);

        return _mapper.Map<DashboardConfigDto>(dashboard);
    }
}
