using MediatR;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.AllocateInterventionArea;

public record AllocateInterventionAreaCommand(
    Guid ProjectId,
    Guid InterventionAreaId,
    decimal BudgetAllocated = 0,
    decimal BudgetPercentage = 0,
    int DirectBeneficiariesMale = 0,
    int DirectBeneficiariesFemale = 0,
    int IndirectBeneficiariesMale = 0,
    int IndirectBeneficiariesFemale = 0) : IRequest<Guid>;
