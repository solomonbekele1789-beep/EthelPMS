using FluentValidation;

namespace NGO.PMS.PlatformAdmin.Application.AccessKeys.Commands.CreateAccessKey;

public class CreateAccessKeyCommandValidator : AbstractValidator<CreateAccessKeyCommand>
{
    public CreateAccessKeyCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Label).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Scopes).NotEmpty();
    }
}
