using MediatR;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.UpdateInterventionArea;

public record UpdateInterventionAreaCommand(
    Guid InterventionAreaId,
    string Name,
    string? Description = null,
    int SortOrder = 0,
    string? AreaType = null,
    double? Latitude = null,
    double? Longitude = null,
    double? Altitude = null,
    double? Accuracy = null,
    string? GpsSource = null,
    string? LandmarkOrAddress = null,
    bool? IsActive = null) : IRequest;
