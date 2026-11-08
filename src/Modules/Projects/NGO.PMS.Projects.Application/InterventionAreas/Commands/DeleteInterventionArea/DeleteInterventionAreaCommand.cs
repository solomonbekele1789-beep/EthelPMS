using MediatR;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.DeleteInterventionArea;

public record DeleteInterventionAreaCommand(Guid InterventionAreaId) : IRequest;
