using MediatR;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateActivity;

public record UpdateActivityCommand(
    Guid ActivityId,
    string Name,
    string? Description,
    string? Unit,
    decimal? LifetimeTarget,
    decimal? BudgetAllocated,
    DateTimeOffset? PlannedStartDate,
    DateTimeOffset? PlannedEndDate,
    string? Assumptions) : IRequest;
