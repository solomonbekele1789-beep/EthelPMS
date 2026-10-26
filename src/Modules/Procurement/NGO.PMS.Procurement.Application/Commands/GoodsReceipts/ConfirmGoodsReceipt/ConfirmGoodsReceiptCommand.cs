using MediatR;

namespace NGO.PMS.Procurement.Application.Commands.GoodsReceipts.ConfirmGoodsReceipt;

public sealed record ConfirmGoodsReceiptCommand(Guid GrnId) : IRequest<Unit>;
