using MediatR;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateOutput;

public record UpdateOutputCommand(
    Guid OutputId,
    string Description,
    decimal? BaselineValue,
    decimal? TargetValue,
    string? Assumptions) : IRequest;
