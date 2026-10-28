using MediatR;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateActivity;

public record CreateActivityCommand(
    string Code,
    string Name,
    Guid OutputId,
    string? Description,
    string? Unit,
    decimal? LifetimeTarget,
    decimal? BudgetAllocated) : IRequest<Guid>;
