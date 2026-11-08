using MediatR;
using NGO.PMS.Planning.Domain.Enums;

namespace NGO.PMS.Planning.Application.Plans.Commands.CreatePlanEntry;

public record CreatePlanEntryCommand(
    PlanLevel Level,
    Guid ProjectId,
    Guid? ParentId,
    string Title,
    string? Description,
    DateTimeOffset PlannedStartDate,
    DateTimeOffset PlannedEndDate,
    decimal PlannedBudget,
    int? FiscalYear,
    int? Quarter,
    int? Month,
    int? WeekNumber,
    DateTimeOffset? DayDate,
    int BeneficiariesMale = 0,
    int BeneficiariesFemale = 0) : IRequest<Guid>;
