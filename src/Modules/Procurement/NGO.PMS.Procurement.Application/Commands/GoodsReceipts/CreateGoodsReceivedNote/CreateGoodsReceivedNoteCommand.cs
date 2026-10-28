using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.GoodsReceipts.CreateGoodsReceivedNote;

public sealed record CreateGoodsReceivedNoteCommand(
    string ReferenceNumber,
    Guid PurchaseOrderId,
    DateTime ReceivedDate,
    string ReceivedBy,
    string? DeliveryNoteNumber,
    string? Remarks) : IRequest<Guid>;
