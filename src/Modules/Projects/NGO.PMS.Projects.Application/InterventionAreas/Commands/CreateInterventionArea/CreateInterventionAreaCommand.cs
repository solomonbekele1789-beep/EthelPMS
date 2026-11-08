using MediatR;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.CreateInterventionArea;

public record CreateInterventionAreaCommand(
    string Name,
    string Code,
    string? Description = null,
    Guid? ParentId = null,
    string? AreaType = "Region",
    double? Latitude = null,
    double? Longitude = null,
    double? Altitude = null,
    double? Accuracy = null,
    string? GpsSource = null,
    string? LandmarkOrAddress = null) : IRequest<Guid>;
