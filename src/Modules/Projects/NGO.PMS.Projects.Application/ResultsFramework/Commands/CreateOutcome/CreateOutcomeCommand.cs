using MediatR;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateOutcome;

public record CreateOutcomeCommand(
    string Code,
    string Description,
    Guid ProjectId,
    decimal? BaselineValue,
    decimal? TargetValue) : IRequest<Guid>;
