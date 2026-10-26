using MediatR;

namespace NGO.PMS.Planning.Application.Plans.Commands.UpdatePlanEntry;

public record UpdatePlanEntryCommand(
    Guid PlanEntryId,
    string Title,
    string? Description,
    DateTimeOffset PlannedStartDate,
    DateTimeOffset PlannedEndDate,
    decimal PlannedBudget) : IRequest;
