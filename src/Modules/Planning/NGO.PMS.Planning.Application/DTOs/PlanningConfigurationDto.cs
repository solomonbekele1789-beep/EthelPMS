namespace NGO.PMS.Planning.Application.DTOs;

public class PlanningConfigurationDto
{
    public Guid Id { get; set; }
    public bool EnableAnnualPlanning { get; set; }
    public bool EnableQuarterlyPlanning { get; set; }
    public bool EnableMonthlyPlanning { get; set; }
    public bool EnableWeeklyPlanning { get; set; }
    public bool EnableDailyPlanning { get; set; }
    public int FiscalYearStartMonth { get; set; }
    public bool DefaultApprovalRequired { get; set; }
}
