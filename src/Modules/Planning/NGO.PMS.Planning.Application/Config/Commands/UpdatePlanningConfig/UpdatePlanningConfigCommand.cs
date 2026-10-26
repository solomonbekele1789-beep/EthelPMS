using MediatR;

namespace NGO.PMS.Planning.Application.Config.Commands.UpdatePlanningConfig;

public record UpdatePlanningConfigCommand(
    bool EnableAnnualPlanning,
    bool EnableQuarterlyPlanning,
    bool EnableMonthlyPlanning,
    bool EnableWeeklyPlanning,
    bool EnableDailyPlanning,
    int FiscalYearStartMonth,
    bool DefaultApprovalRequired) : IRequest;
