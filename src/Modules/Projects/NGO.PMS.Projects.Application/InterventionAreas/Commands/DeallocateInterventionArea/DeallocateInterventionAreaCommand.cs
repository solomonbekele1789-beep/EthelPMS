using MediatR;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.DeallocateInterventionArea;

public record DeallocateInterventionAreaCommand(Guid ProjectId, Guid AllocationId) : IRequest;
