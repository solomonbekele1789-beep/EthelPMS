using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SystemReports.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.SystemReports.Application.ReportTemplates.Queries.GetReportTemplateById;

public class GetReportTemplateByIdQueryHandler : IRequestHandler<GetReportTemplateByIdQuery, ReportTemplateDto>
{
    private readonly ISystemReportsDbContext _db;
    private readonly IMapper _mapper;

    public GetReportTemplateByIdQueryHandler(ISystemReportsDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<ReportTemplateDto> Handle(GetReportTemplateByIdQuery request, CancellationToken ct)
    {
        var template = await _db.ReportTemplates
            .FirstOrDefaultAsync(t => t.Id == request.Id, ct)
            ?? throw new NotFoundException("ReportTemplate", request.Id);

        return _mapper.Map<ReportTemplateDto>(template);
    }
}
