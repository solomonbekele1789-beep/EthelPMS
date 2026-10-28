using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.Reporting.Application.DTOs;
using NGO.PMS.Reporting.Domain.Enums;

namespace NGO.PMS.Reporting.Application.Reports.Queries.GetFinancialSummary;

public class GetFinancialSummaryQueryHandler : IRequestHandler<GetFinancialSummaryQuery, FinancialSummaryDto>
{
    private readonly IReportingDbContext _db;

    public GetFinancialSummaryQueryHandler(IReportingDbContext db) => _db = db;

    public async Task<FinancialSummaryDto> Handle(GetFinancialSummaryQuery request, CancellationToken ct)
    {
        var query = _db.Reports
            .Where(r => r.ProjectId == request.ProjectId)
            .Where(r => r.Status == ReportStatus.Approved);

        if (request.FiscalYear.HasValue)
            query = query.Where(r => r.FiscalYear == request.FiscalYear.Value);

        var reports = await query.ToListAsync(ct);
        var reportCount = reports.Count;

        var totalPlanned = reports.Sum(r => r.PlannedBudget);
        var totalActual = reports.Sum(r => r.ActualSpent);
        var variance = totalPlanned - totalActual;
        var utilizationRate = totalPlanned > 0
            ? Math.Round(totalActual / totalPlanned * 100, 2) : 0;
        var cumulativeYtd = reports
            .Where(r => r.CumulativeYtdSpent.HasValue)
            .Select(r => r.CumulativeYtdSpent!.Value)
            .DefaultIfEmpty(0)
            .Max();
        var burnRate = totalPlanned > 0
            ? Math.Round(totalActual / totalPlanned * 100, 2) : 0;

        return new FinancialSummaryDto
        {
            ProjectId = request.ProjectId,
            TotalPlannedBudget = totalPlanned,
            TotalActualSpent = totalActual,
            Variance = variance,
            BudgetUtilizationRate = utilizationRate,
            CumulativeYtdSpent = cumulativeYtd,
            BurnRate = burnRate,
            ReportCount = reportCount
        };
    }
}
