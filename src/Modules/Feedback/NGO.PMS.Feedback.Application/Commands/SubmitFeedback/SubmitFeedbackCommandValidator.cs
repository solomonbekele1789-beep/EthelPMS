using FluentValidation;

namespace NGO.PMS.Feedback.Application.Commands.SubmitFeedback;

public sealed class SubmitFeedbackCommandValidator : AbstractValidator<SubmitFeedbackCommand>
{
    public SubmitFeedbackCommandValidator()
    {
        RuleFor(x => x.Description).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.Priority).IsInEnum();
        RuleFor(x => x.Channel).IsInEnum();
        RuleFor(x => x.SubmitterName).MaximumLength(200);
        RuleFor(x => x.SubmitterContact).MaximumLength(200);
        RuleFor(x => x.Location).MaximumLength(500);
    }
}
