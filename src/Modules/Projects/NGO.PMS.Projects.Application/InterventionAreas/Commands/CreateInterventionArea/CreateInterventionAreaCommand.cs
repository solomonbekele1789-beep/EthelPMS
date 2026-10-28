using MediatR;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.CreateInterventionArea;

public record CreateInterventionAreaCommand(
    string Name,
    string Code,
    string? Description,
    Guid? ParentId) : IRequest<Guid>;
