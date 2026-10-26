using FluentValidation;

namespace NGO.PMS.Partnerships.Application.Commands.UpdateSubGrantee;

public sealed class UpdateSubGranteeCommandValidator : AbstractValidator<UpdateSubGranteeCommand>
{
    public UpdateSubGranteeCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.ContactPerson).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ContactEmail).NotEmpty().MaximumLength(200).EmailAddress();
    }
}
