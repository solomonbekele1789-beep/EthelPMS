using FluentValidation;

namespace NGO.PMS.Planning.Application.Dip.Commands.CreateDipItem;

public class CreateDipItemCommandValidator : AbstractValidator<CreateDipItemCommand>
{
    public CreateDipItemCommandValidator()
    {
        RuleFor(x => x.ActivityId).NotEmpty();
        RuleFor(x => x.ProjectId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.PlannedStartDate).NotEmpty();
        RuleFor(x => x.PlannedEndDate).NotEmpty().GreaterThan(x => x.PlannedStartDate);
        RuleFor(x => x.BudgetAllocated).GreaterThanOrEqualTo(0);
    }
}
