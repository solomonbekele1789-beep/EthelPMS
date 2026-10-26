using MediatR;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateOutcome;

public record UpdateOutcomeCommand(
    Guid OutcomeId,
    string Description,
    decimal? BaselineValue,
    decimal? TargetValue,
    string? Assumptions) : IRequest;
