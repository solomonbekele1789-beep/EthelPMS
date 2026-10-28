using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.Reporting.Application.DTOs;

namespace NGO.PMS.Reporting.Application.Templates.Queries.ListReportTemplates;

public class ListReportTemplatesQueryHandler : IRequestHandler<ListReportTemplatesQuery, List<ReportTemplateDto>>
{
    private readonly IReportingDbContext _db;
    private readonly IMapper _mapper;

    public ListReportTemplatesQueryHandler(IReportingDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<ReportTemplateDto>> Handle(ListReportTemplatesQuery request, CancellationToken ct)
    {
        var query = _db.ReportTemplates
            .Where(t => t.IsActive)
            .AsQueryable();

        if (request.ReportType.HasValue)
            query = query.Where(t => t.ReportType == request.ReportType.Value);

        return await query
            .Include(t => t.Sections)
            .OrderBy(t => t.Name)
            .ProjectTo<ReportTemplateDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
