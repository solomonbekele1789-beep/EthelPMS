using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.Partnerships.Application.DTOs;
using NGO.PMS.Partnerships.Domain.Enums;

namespace NGO.PMS.Partnerships.Application.Queries.GetPartnershipDashboard;

public sealed class GetPartnershipDashboardQueryHandler : IRequestHandler<GetPartnershipDashboardQuery, PartnershipDashboardDto>
{
    private readonly IPartnershipsDbContext _db;

    public GetPartnershipDashboardQueryHandler(IPartnershipsDbContext db)
    { _db = db; }

    public async Task<PartnershipDashboardDto> Handle(GetPartnershipDashboardQuery request, CancellationToken ct)
    {
        var totalPartners = await _db.SubGrantees.AsNoTracking().CountAsync(ct);
        var activePartners = await _db.SubGrantees.AsNoTracking().CountAsync(s => s.Status == PartnerStatus.Active, ct);
        var totalDisbursed = await _db.Disbursements.AsNoTracking().Where(d => d.Status == DisbursementStatus.Disbursed).SumAsync(d => d.Amount, ct);
        var pendingReports = await _db.PartnerReports.AsNoTracking().CountAsync(r => r.Status == ReportStatus.Draft || r.Status == ReportStatus.Submitted, ct);
        var overdueCompliance = await _db.PartnerCompliances.AsNoTracking().CountAsync(c => c.Status == ComplianceStatus.FollowUpRequired && c.FollowUpDate < DateTime.UtcNow, ct);

        var riskDistribution = await _db.SubGrantees.AsNoTracking()
            .GroupBy(s => s.RiskRating)
            .Select(g => new { Rating = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Rating.ToString(), x => x.Count, ct);

        return new PartnershipDashboardDto
        {
            TotalPartners = totalPartners,
            ActivePartners = activePartners,
            TotalDisbursed = totalDisbursed,
            PendingReports = pendingReports,
            OverdueCompliance = overdueCompliance,
            RiskDistribution = riskDistribution
        };
    }
}
