using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.Reporting.Application.DTOs;

namespace NGO.PMS.Reporting.Application.Reports.Queries.GetApprovalHistory;

public class GetApprovalHistoryQueryHandler : IRequestHandler<GetApprovalHistoryQuery, List<ReportApprovalDto>>
{
    private readonly IReportingDbContext _db;
    private readonly IMapper _mapper;

    public GetApprovalHistoryQueryHandler(IReportingDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<ReportApprovalDto>> Handle(GetApprovalHistoryQuery request, CancellationToken ct)
    {
        return await _db.ReportApprovals
            .Where(a => a.ReportId == request.ReportId)
            .OrderBy(a => a.ActionDate)
            .ProjectTo<ReportApprovalDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
