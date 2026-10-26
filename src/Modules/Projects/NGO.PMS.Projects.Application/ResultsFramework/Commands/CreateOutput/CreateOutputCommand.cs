using MediatR;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateOutput;

public record CreateOutputCommand(
    string Code,
    string Description,
    Guid OutcomeId,
    decimal? BaselineValue,
    decimal? TargetValue) : IRequest<Guid>;
