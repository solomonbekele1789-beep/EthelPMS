using FluentValidation;

namespace NGO.PMS.Partnerships.Application.Commands.RegisterSubGrantee;

public sealed class RegisterSubGranteeCommandValidator : AbstractValidator<RegisterSubGranteeCommand>
{
    public RegisterSubGranteeCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.ContactPerson).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ContactEmail).NotEmpty().MaximumLength(200).EmailAddress();
        RuleFor(x => x.Country).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PartnerType).IsInEnum();
    }
}
