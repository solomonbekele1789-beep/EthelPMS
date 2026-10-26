using FluentValidation;

namespace NGO.PMS.Projects.Application.Projects.Commands.CreateProject;

public class CreateProjectCommandValidator : AbstractValidator<CreateProjectCommand>
{
    public CreateProjectCommandValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate).NotEmpty().GreaterThan(x => x.StartDate)
            .WithMessage("End date must be after start date.");
        RuleFor(x => x.TotalBudget).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CurrencyId).NotEmpty();
    }
}
