using MediatR;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateIndicator;

public record CreateIndicatorCommand(
    string Code,
    string Name,
    Guid ProjectId,
    Guid? OutcomeId,
    Guid? OutputId,
    Guid? UnitOfMeasurementId,
    decimal? BaselineValue,
    decimal? TargetValue,
    string? DataSource,
    string? CollectionFrequency) : IRequest<Guid>;
