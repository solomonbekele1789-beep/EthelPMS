using FluentValidation;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateIndicator;

public class UpdateIndicatorCommandValidator : AbstractValidator<UpdateIndicatorCommand>
{
    public UpdateIndicatorCommandValidator()
    {
        RuleFor(x => x.IndicatorId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}
