using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.Reporting.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Reporting.Application.Templates.Queries.GetReportTemplate;

public class GetReportTemplateQueryHandler : IRequestHandler<GetReportTemplateQuery, ReportTemplateDto>
{
    private readonly IReportingDbContext _db;
    private readonly IMapper _mapper;

    public GetReportTemplateQueryHandler(IReportingDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<ReportTemplateDto> Handle(GetReportTemplateQuery request, CancellationToken ct)
    {
        var template = await _db.ReportTemplates
            .Include(t => t.Sections)
            .FirstOrDefaultAsync(t => t.Id == request.TemplateId, ct)
            ?? throw new NotFoundException("ReportTemplate", request.TemplateId);

        return _mapper.Map<ReportTemplateDto>(template);
    }
}
