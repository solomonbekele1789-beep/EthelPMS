using FluentValidation;

namespace NGO.PMS.Donors.Application.Commands.CreateGrant;

public sealed class CreateGrantCommandValidator : AbstractValidator<CreateGrantCommand>
{
    public CreateGrantCommandValidator()
    {
        RuleFor(x => x.DonorId).NotEmpty();
        RuleFor(x => x.GrantNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(300);
        RuleFor(x => x.TotalAmount).GreaterThan(0);
        RuleFor(x => x.CurrencyCode).NotEmpty().MaximumLength(3);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate).NotEmpty().GreaterThan(x => x.StartDate)
            .WithMessage("End date must be after start date.");
        RuleFor(x => x.Status).IsInEnum();
    }
}
