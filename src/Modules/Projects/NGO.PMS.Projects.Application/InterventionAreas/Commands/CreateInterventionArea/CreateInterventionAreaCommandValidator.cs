using FluentValidation;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.CreateInterventionArea;

public class CreateInterventionAreaCommandValidator : AbstractValidator<CreateInterventionAreaCommand>
{
    public CreateInterventionAreaCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
    }
}
