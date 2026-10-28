using MediatR;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.UpdateInterventionArea;

public record UpdateInterventionAreaCommand(
    Guid InterventionAreaId,
    string Name,
    string? Description,
    int SortOrder) : IRequest;
