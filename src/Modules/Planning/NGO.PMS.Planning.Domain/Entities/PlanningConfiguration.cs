using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Planning.Domain.Entities;

/// <summary>
/// Organization-level planning configuration.
/// Controls which planning levels are enabled and fiscal year settings.
/// </summary>
public class PlanningConfiguration : AuditableEntity
{
    public Guid OrganizationId { get; set; }
    public bool EnableAnnualPlanning { get; private set; } = true;
    public bool EnableQuarterlyPlanning { get; private set; } = true;
    public bool EnableMonthlyPlanning { get; private set; } = true;
    public bool EnableWeeklyPlanning { get; private set; }
    public bool EnableDailyPlanning { get; private set; }
    public int FiscalYearStartMonth { get; private set; } = 7; // Ethiopian calendar default (Meskerem ≈ July)
    public bool DefaultApprovalRequired { get; private set; } = true;

    public static PlanningConfiguration CreateDefault(Guid orgId)
    {
        return new PlanningConfiguration
        {
            OrganizationId = orgId,
            EnableAnnualPlanning = true,
            EnableQuarterlyPlanning = true,
            EnableMonthlyPlanning = true,
            EnableWeeklyPlanning = false,
            EnableDailyPlanning = false,
            FiscalYearStartMonth = 7,
            DefaultApprovalRequired = true
        };
    }

    public void Update(bool annualEnabled, bool quarterlyEnabled, bool monthlyEnabled,
        bool weeklyEnabled, bool dailyEnabled, int fiscalYearStartMonth, bool approvalRequired)
    {
        if (fiscalYearStartMonth < 1 || fiscalYearStartMonth > 12)
            throw new ArgumentException("Fiscal year start month must be 1-12.", nameof(fiscalYearStartMonth));
        EnableAnnualPlanning = annualEnabled;
        EnableQuarterlyPlanning = quarterlyEnabled;
        EnableMonthlyPlanning = monthlyEnabled;
        EnableWeeklyPlanning = weeklyEnabled;
        EnableDailyPlanning = dailyEnabled;
        FiscalYearStartMonth = fiscalYearStartMonth;
        DefaultApprovalRequired = approvalRequired;
    }

    public bool IsLevelEnabled(NGO.PMS.Planning.Domain.Enums.PlanLevel level) => level switch
    {
        Enums.PlanLevel.Annual => EnableAnnualPlanning,
        Enums.PlanLevel.Quarterly => EnableQuarterlyPlanning,
        Enums.PlanLevel.Monthly => EnableMonthlyPlanning,
        Enums.PlanLevel.Weekly => EnableWeeklyPlanning,
        Enums.PlanLevel.Daily => EnableDailyPlanning,
        _ => false
    };
}
