using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.Reporting.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Reporting.Application.Reports.Queries.GetReport;

public class GetReportQueryHandler : IRequestHandler<GetReportQuery, ReportDto>
{
    private readonly IReportingDbContext _db;
    private readonly IMapper _mapper;

    public GetReportQueryHandler(IReportingDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<ReportDto> Handle(GetReportQuery request, CancellationToken ct)
    {
        var report = await _db.Reports
            .Include(r => r.Sections)
                .ThenInclude(s => s.DataEntries)
            .Include(r => r.Approvals)
            .Include(r => r.Comments.Where(c => c.ParentCommentId == null))
                .ThenInclude(c => c.Replies)
            .FirstOrDefaultAsync(r => r.Id == request.ReportId, ct)
            ?? throw new NotFoundException("Report", request.ReportId);

        return _mapper.Map<ReportDto>(report);
    }
}
