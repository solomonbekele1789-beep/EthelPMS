using FluentValidation;

namespace NGO.PMS.Identity.Application.Roles.Commands.CreateRole;

public class CreateRoleCommandValidator : AbstractValidator<CreateRoleCommand>
{
    public CreateRoleCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PermissionIds).NotEmpty().WithMessage("At least one permission required.");
    }
}
