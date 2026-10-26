using FluentValidation;

namespace NGO.PMS.Notifications.Application.Commands.Notifications.CreateNotification;

public sealed class CreateNotificationCommandValidator
    : AbstractValidator<CreateNotificationCommand>
{
    public CreateNotificationCommandValidator()
    {
        RuleFor(x => x.RecipientUserId)
            .NotEmpty();

        RuleFor(x => x.EventType)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(300);

        RuleFor(x => x.Body)
            .NotEmpty()
            .MaximumLength(2000);

        RuleFor(x => x.ActionUrl)
            .MaximumLength(500)
            .When(x => x.ActionUrl is not null);

        RuleFor(x => x.EntityId)
            .MaximumLength(100)
            .When(x => x.EntityId is not null);

        RuleFor(x => x.EntityType)
            .MaximumLength(100)
            .When(x => x.EntityType is not null);

        RuleFor(x => x.Priority)
            .IsInEnum();
    }
}
