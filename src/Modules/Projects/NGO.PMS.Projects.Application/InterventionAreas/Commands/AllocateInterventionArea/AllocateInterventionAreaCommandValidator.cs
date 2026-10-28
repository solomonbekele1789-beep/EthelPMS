using FluentValidation;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.AllocateInterventionArea;

public class AllocateInterventionAreaCommandValidator : AbstractValidator<AllocateInterventionAreaCommand>
{
    public AllocateInterventionAreaCommandValidator()
    {
        RuleFor(x => x.ProjectId).NotEmpty();
        RuleFor(x => x.InterventionAreaId).NotEmpty();
        RuleFor(x => x.BudgetAllocated).GreaterThanOrEqualTo(0);
        RuleFor(x => x.BudgetPercentage).InclusiveBetween(0, 100);
    }
}
