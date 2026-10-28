using FluentValidation;

namespace NGO.PMS.Procurement.Application.Commands.RFQs.CreateRfq;

public sealed class CreateRfqCommandValidator : AbstractValidator<CreateRfqCommand>
{
    public CreateRfqCommandValidator()
    {
        RuleFor(x => x.ReferenceNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.PurchaseRequestId).NotEmpty();
        RuleFor(x => x.Deadline).GreaterThan(DateTime.UtcNow)
            .WithMessage("Deadline must be in the future.");
    }
}
