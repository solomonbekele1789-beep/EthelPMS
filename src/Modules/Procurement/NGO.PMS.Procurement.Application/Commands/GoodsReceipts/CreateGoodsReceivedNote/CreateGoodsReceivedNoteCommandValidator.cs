using FluentValidation;

namespace NGO.PMS.Procurement.Application.Commands.GoodsReceipts.CreateGoodsReceivedNote;

public sealed class CreateGoodsReceivedNoteCommandValidator : AbstractValidator<CreateGoodsReceivedNoteCommand>
{
    public CreateGoodsReceivedNoteCommandValidator()
    {
        RuleFor(x => x.ReferenceNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.PurchaseOrderId).NotEmpty();
        RuleFor(x => x.ReceivedBy).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ReceivedDate).NotEmpty();
    }
}
