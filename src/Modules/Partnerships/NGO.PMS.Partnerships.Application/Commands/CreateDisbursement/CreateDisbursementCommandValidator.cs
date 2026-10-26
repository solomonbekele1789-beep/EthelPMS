using FluentValidation;

namespace NGO.PMS.Partnerships.Application.Commands.CreateDisbursement;

public sealed class CreateDisbursementCommandValidator : AbstractValidator<CreateDisbursementCommand>
{
    public CreateDisbursementCommandValidator()
    {
        RuleFor(x => x.SubGranteeId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.DisbursementDate).NotEmpty();
        RuleFor(x => x.ReferenceNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Purpose).NotEmpty().MaximumLength(1000);
    }
}
