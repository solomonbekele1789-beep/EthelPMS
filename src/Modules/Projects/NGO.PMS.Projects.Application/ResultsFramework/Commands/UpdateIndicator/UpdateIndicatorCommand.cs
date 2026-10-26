using MediatR;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateIndicator;

public record UpdateIndicatorCommand(
    Guid IndicatorId,
    string Name,
    string? Description,
    decimal? BaselineValue,
    decimal? TargetValue,
    string? DataSource,
    string? CollectionFrequency,
    string? MeansOfVerification,
    Guid? UnitOfMeasurementId) : IRequest;
