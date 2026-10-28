using FluentValidation;

namespace NGO.PMS.Procurement.Application.Commands.ProcurementPlans.CreateProcurementPlan;

public sealed class CreateProcurementPlanCommandValidator : AbstractValidator<CreateProcurementPlanCommand>
{
    public CreateProcurementPlanCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.FiscalYear).GreaterThan(0);
        RuleFor(x => x.ProjectId).NotEmpty();
    }
}
