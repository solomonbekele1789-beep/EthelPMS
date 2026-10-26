using FluentValidation;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateOutcome;

public class UpdateOutcomeCommandValidator : AbstractValidator<UpdateOutcomeCommand>
{
    public UpdateOutcomeCommandValidator()
    {
        RuleFor(x => x.OutcomeId).NotEmpty();
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
    }
}
