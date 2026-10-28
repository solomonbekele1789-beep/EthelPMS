using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SystemReports.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.SystemReports.Application.GeneratedReports.Queries.GetGeneratedReportById;

public class GetGeneratedReportByIdQueryHandler : IRequestHandler<GetGeneratedReportByIdQuery, GeneratedReportDto>
{
    private readonly ISystemReportsDbContext _db;
    private readonly IMapper _mapper;

    public GetGeneratedReportByIdQueryHandler(ISystemReportsDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<GeneratedReportDto> Handle(GetGeneratedReportByIdQuery request, CancellationToken ct)
    {
        var report = await _db.GeneratedReports
            .Include(r => r.ReportTemplate)
            .FirstOrDefaultAsync(r => r.Id == request.Id, ct)
            ?? throw new NotFoundException("GeneratedReport", request.Id);

        return _mapper.Map<GeneratedReportDto>(report);
    }
}
