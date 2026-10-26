using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SystemReports.Application.DTOs;

namespace NGO.PMS.SystemReports.Application.ReportTemplates.Queries.GetReportTemplates;

public class GetReportTemplatesQueryHandler : IRequestHandler<GetReportTemplatesQuery, List<ReportTemplateDto>>
{
    private readonly ISystemReportsDbContext _db;
    private readonly IMapper _mapper;

    public GetReportTemplatesQueryHandler(ISystemReportsDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<ReportTemplateDto>> Handle(GetReportTemplatesQuery request, CancellationToken ct)
    {
        var query = _db.ReportTemplates.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Module))
            query = query.Where(t => t.Module == request.Module);

        return await query
            .OrderByDescending(t => t.CreatedAt)
            .ProjectTo<ReportTemplateDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
