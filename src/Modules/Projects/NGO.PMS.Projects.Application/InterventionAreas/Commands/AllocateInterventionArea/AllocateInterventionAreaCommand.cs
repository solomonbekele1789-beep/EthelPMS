using MediatR;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.AllocateInterventionArea;

public record AllocateInterventionAreaCommand(
    Guid ProjectId,
    Guid InterventionAreaId,
    decimal BudgetAllocated,
    decimal BudgetPercentage) : IRequest<Guid>;
