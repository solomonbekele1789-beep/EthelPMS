using FluentValidation;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.UpdateInterventionArea;

public class UpdateInterventionAreaCommandValidator : AbstractValidator<UpdateInterventionAreaCommand>
{
    public UpdateInterventionAreaCommandValidator()
    {
        RuleFor(x => x.InterventionAreaId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}
