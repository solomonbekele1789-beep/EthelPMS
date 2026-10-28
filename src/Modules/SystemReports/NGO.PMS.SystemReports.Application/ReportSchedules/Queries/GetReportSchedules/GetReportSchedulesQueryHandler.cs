using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SystemReports.Application.DTOs;

namespace NGO.PMS.SystemReports.Application.ReportSchedules.Queries.GetReportSchedules;

public class GetReportSchedulesQueryHandler : IRequestHandler<GetReportSchedulesQuery, List<ReportScheduleDto>>
{
    private readonly ISystemReportsDbContext _db;
    private readonly IMapper _mapper;

    public GetReportSchedulesQueryHandler(ISystemReportsDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<ReportScheduleDto>> Handle(GetReportSchedulesQuery request, CancellationToken ct)
    {
        return await _db.ReportSchedules
            .Include(s => s.ReportTemplate)
            .OrderByDescending(s => s.CreatedAt)
            .ProjectTo<ReportScheduleDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
