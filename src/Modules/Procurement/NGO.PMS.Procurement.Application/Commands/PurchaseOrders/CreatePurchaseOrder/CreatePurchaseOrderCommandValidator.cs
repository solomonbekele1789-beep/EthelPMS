using FluentValidation;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseOrders.CreatePurchaseOrder;

public sealed class CreatePurchaseOrderCommandValidator : AbstractValidator<CreatePurchaseOrderCommand>
{
    public CreatePurchaseOrderCommandValidator()
    {
        RuleFor(x => x.ReferenceNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.PurchaseRequestId).NotEmpty();
        RuleFor(x => x.SupplierId).NotEmpty();
    }
}
