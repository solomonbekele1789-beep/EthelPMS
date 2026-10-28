using FluentValidation;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseRequests.CreatePurchaseRequest;

public sealed class CreatePurchaseRequestCommandValidator : AbstractValidator<CreatePurchaseRequestCommand>
{
    public CreatePurchaseRequestCommandValidator()
    {
        RuleFor(x => x.ReferenceNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ProjectId).NotEmpty();
        RuleFor(x => x.Justification).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Method).IsInEnum();
    }
}
