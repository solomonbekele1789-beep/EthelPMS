using FluentValidation;

namespace NGO.PMS.Notifications.Application.Commands.NotificationTemplates.CreateNotificationTemplate;

public sealed class CreateNotificationTemplateCommandValidator
    : AbstractValidator<CreateNotificationTemplateCommand>
{
    public CreateNotificationTemplateCommandValidator()
    {
        RuleFor(x => x.EventType)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.TitleTemplateEn)
            .NotEmpty()
            .MaximumLength(300);

        RuleFor(x => x.BodyTemplateEn)
            .NotEmpty()
            .MaximumLength(2000);

        RuleFor(x => x.TitleTemplateAm)
            .MaximumLength(300)
            .When(x => x.TitleTemplateAm is not null);

        RuleFor(x => x.BodyTemplateAm)
            .MaximumLength(2000)
            .When(x => x.BodyTemplateAm is not null);

        RuleFor(x => x.DefaultChannel)
            .IsInEnum();
    }
}
