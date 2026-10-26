using FluentValidation;

namespace NGO.PMS.Donors.Application.Commands.CreateDonor;

public sealed class CreateDonorCommandValidator : AbstractValidator<CreateDonorCommand>
{
    public CreateDonorCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Acronym).MaximumLength(50);
        RuleFor(x => x.Country).MaximumLength(100);
        RuleFor(x => x.Website).MaximumLength(500);
        RuleFor(x => x.Email).MaximumLength(200).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email));
        RuleFor(x => x.Phone).MaximumLength(50);
        RuleFor(x => x.Address).MaximumLength(500);
    }
}
