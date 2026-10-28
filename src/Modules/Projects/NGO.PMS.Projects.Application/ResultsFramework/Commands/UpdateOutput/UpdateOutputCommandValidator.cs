using FluentValidation;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateOutput;

public class UpdateOutputCommandValidator : AbstractValidator<UpdateOutputCommand>
{
    public UpdateOutputCommandValidator()
    {
        RuleFor(x => x.OutputId).NotEmpty();
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
    }
}
