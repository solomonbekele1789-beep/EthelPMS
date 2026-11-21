using FluentValidation;

namespace NGO.PMS.Identity.Application.Users.Commands.CreateUser;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.MiddleName).MaximumLength(100).When(x => !string.IsNullOrEmpty(x.MiddleName));
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Phone).MaximumLength(20).When(x => !string.IsNullOrEmpty(x.Phone));
        RuleFor(x => x.RoleIds).NotEmpty().WithMessage("At least one role must be assigned.");
        RuleFor(x => x.Password).MinimumLength(8).When(x => !string.IsNullOrEmpty(x.Password));
        RuleFor(x => x.EmployeeId).MaximumLength(50).When(x => !string.IsNullOrEmpty(x.EmployeeId));
        RuleFor(x => x.LevelOfEducation).MaximumLength(100).When(x => !string.IsNullOrEmpty(x.LevelOfEducation));
        RuleFor(x => x.Qualification).MaximumLength(200).When(x => !string.IsNullOrEmpty(x.Qualification));
        RuleFor(x => x.Address).MaximumLength(500).When(x => !string.IsNullOrEmpty(x.Address));
        RuleFor(x => x.Region).MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Region));
        RuleFor(x => x.OfficeLevel).MaximumLength(50).When(x => !string.IsNullOrEmpty(x.OfficeLevel));
    }
}
