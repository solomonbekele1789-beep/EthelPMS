using FluentValidation;

namespace NGO.PMS.Planning.Application.Plans.Commands.CreatePlanEntry;

public class CreatePlanEntryCommandValidator : AbstractValidator<CreatePlanEntryCommand>
{
    public CreatePlanEntryCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ProjectId).NotEmpty();
        RuleFor(x => x.Level).IsInEnum();
        RuleFor(x => x.PlannedStartDate).NotEmpty();
        RuleFor(x => x.PlannedEndDate).NotEmpty().GreaterThan(x => x.PlannedStartDate)
            .WithMessage("End date must be after start date.");
        RuleFor(x => x.PlannedBudget).GreaterThanOrEqualTo(0);
    }
}
