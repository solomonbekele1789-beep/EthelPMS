using FluentValidation;

namespace NGO.PMS.Feedback.Application.Commands.CreateFeedbackCategory;

public sealed class CreateFeedbackCategoryCommandValidator : AbstractValidator<CreateFeedbackCategoryCommand>
{
    public CreateFeedbackCategoryCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DefaultType).IsInEnum();
        RuleFor(x => x.SlaResponseDays).GreaterThan(0);
        RuleFor(x => x.SlaResolutionDays).GreaterThan(0);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
    }
}
