using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.Donors.Application.DTOs;
using NGO.PMS.Donors.Domain.Enums;

namespace NGO.PMS.Donors.Application.Queries.GetComplianceDashboard;

public sealed class GetComplianceDashboardQueryHandler : IRequestHandler<GetComplianceDashboardQuery, List<ComplianceDashboardDto>>
{
    private readonly IDonorsDbContext _db;

    public GetComplianceDashboardQueryHandler(IDonorsDbContext db)
    {
        _db = db;
    }

    public async Task<List<ComplianceDashboardDto>> Handle(GetComplianceDashboardQuery request, CancellationToken ct)
    {
        var now = DateTime.UtcNow;

        var activeGrants = await _db.Grants
            .AsNoTracking()
            .Where(g => g.Status == GrantStatus.Active)
            .Include(g => g.Conditions)
            .Select(g => new
            {
                g.Id,
                g.DonorId,
                g.GrantNumber,
                g.ComplianceStatus,
                Conditions = g.Conditions.Where(c => c.Status == ConditionStatus.Pending || c.Status == ConditionStatus.Overdue).ToList()
            })
            .ToListAsync(ct);

        var donorIds = activeGrants.Select(g => g.DonorId).Distinct().ToList();
        var donors = await _db.Donors
            .AsNoTracking()
            .Where(d => donorIds.Contains(d.Id))
            .ToDictionaryAsync(d => d.Id, d => d.Name, ct);

        var result = activeGrants.Select(g =>
        {
            var overdueCount = g.Conditions.Count(c => c.Status == ConditionStatus.Overdue ||
                (c.Status == ConditionStatus.Pending && c.DueDate < now));
            var nextDue = g.Conditions
                .Where(c => c.Status == ConditionStatus.Pending && c.DueDate >= now)
                .OrderBy(c => c.DueDate)
                .Select(c => (DateTime?)c.DueDate)
                .FirstOrDefault();

            return new ComplianceDashboardDto
            {
                GrantId = g.Id,
                DonorName = donors.GetValueOrDefault(g.DonorId, "Unknown"),
                GrantNumber = g.GrantNumber,
                ComplianceStatus = g.ComplianceStatus.ToString(),
                OverdueConditions = overdueCount,
                NextDueDate = nextDue
            };
        }).ToList();

        return result;
    }
}
