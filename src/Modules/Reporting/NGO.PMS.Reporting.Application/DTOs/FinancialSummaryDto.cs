namespace NGO.PMS.Reporting.Application.DTOs;

/// <summary>
/// Financial calculations for REQ-RPT-013/014/015.
/// </summary>
public class FinancialSummaryDto
{
    public Guid ProjectId { get; set; }
    public decimal TotalPlannedBudget { get; set; }
    public decimal TotalActualSpent { get; set; }
    public decimal Variance { get; set; }
    public decimal BudgetUtilizationRate { get; set; }
    public decimal CumulativeYtdSpent { get; set; }
    public decimal BurnRate { get; set; }
    public int ReportCount { get; set; }
}
