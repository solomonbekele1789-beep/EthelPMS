using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SystemReports.Application.DTOs;

namespace NGO.PMS.SystemReports.Application.GeneratedReports.Queries.GetGeneratedReports;

public class GetGeneratedReportsQueryHandler : IRequestHandler<GetGeneratedReportsQuery, List<GeneratedReportDto>>
{
    private readonly ISystemReportsDbContext _db;
    private readonly IMapper _mapper;

    public GetGeneratedReportsQueryHandler(ISystemReportsDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<GeneratedReportDto>> Handle(GetGeneratedReportsQuery request, CancellationToken ct)
    {
        var query = _db.GeneratedReports
            .Include(r => r.ReportTemplate)
            .AsQueryable();

        if (request.ReportTemplateId.HasValue)
            query = query.Where(r => r.ReportTemplateId == request.ReportTemplateId.Value);

        if (request.DateFrom.HasValue)
            query = query.Where(r => r.GeneratedAt >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(r => r.GeneratedAt <= request.DateTo.Value);

        return await query
            .OrderByDescending(r => r.GeneratedAt)
            .ProjectTo<GeneratedReportDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
