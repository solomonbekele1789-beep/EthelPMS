using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.Partnerships.Application.DTOs;

namespace NGO.PMS.Partnerships.Application.Queries.GetPartnerReports;

public sealed class GetPartnerReportsQueryHandler : IRequestHandler<GetPartnerReportsQuery, List<PartnerReportListDto>>
{
    private readonly IPartnershipsDbContext _db;

    public GetPartnerReportsQueryHandler(IPartnershipsDbContext db)
    { _db = db; }

    public async Task<List<PartnerReportListDto>> Handle(GetPartnerReportsQuery request, CancellationToken ct)
    {
        var query = _db.PartnerReports.AsNoTracking().AsQueryable();

        if (request.SubGranteeId.HasValue)
            query = query.Where(x => x.SubGranteeId == request.SubGranteeId.Value);

        if (request.Status.HasValue)
            query = query.Where(x => x.Status == request.Status.Value);

        var reports = await query.OrderByDescending(x => x.ReportingPeriodEnd).ToListAsync(ct);

        var subGranteeIds = reports.Select(r => r.SubGranteeId).Distinct().ToList();
        var subGrantees = await _db.SubGrantees.AsNoTracking()
            .Where(s => subGranteeIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id, s => s.Name, ct);

        return reports.Select(r => new PartnerReportListDto
        {
            Id = r.Id,
            SubGranteeId = r.SubGranteeId,
            SubGranteeName = subGrantees.GetValueOrDefault(r.SubGranteeId, string.Empty),
            ReportType = r.ReportType.ToString(),
            ReportingPeriodStart = r.ReportingPeriodStart,
            ReportingPeriodEnd = r.ReportingPeriodEnd,
            Status = r.Status.ToString(),
            SubmittedAt = r.SubmittedAt
        }).ToList();
    }
}
