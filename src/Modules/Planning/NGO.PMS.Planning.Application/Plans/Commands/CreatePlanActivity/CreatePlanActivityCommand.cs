using MediatR;

namespace NGO.PMS.Planning.Application.Plans.Commands.CreatePlanActivity;

public record CreatePlanActivityCommand(
    Guid PlanEntryId,
    Guid? OutcomeId,
    Guid? OutputId,
    Guid? ActivityId,
    decimal PlannedBudget,
    Guid? ResponsibleUserId) : IRequest<Guid>;
