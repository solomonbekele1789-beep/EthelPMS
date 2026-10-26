using FluentValidation;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateActivity;

public class UpdateActivityCommandValidator : AbstractValidator<UpdateActivityCommand>
{
    public UpdateActivityCommandValidator()
    {
        RuleFor(x => x.ActivityId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}
