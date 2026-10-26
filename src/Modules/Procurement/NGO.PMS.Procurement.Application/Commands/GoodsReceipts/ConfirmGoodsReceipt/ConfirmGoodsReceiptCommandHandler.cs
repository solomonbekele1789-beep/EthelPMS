using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Commands.GoodsReceipts.ConfirmGoodsReceipt;

public sealed class ConfirmGoodsReceiptCommandHandler : IRequestHandler<ConfirmGoodsReceiptCommand, Unit>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ConfirmGoodsReceiptCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Unit> Handle(ConfirmGoodsReceiptCommand request, CancellationToken ct)
    {
        var grn = await _db.GoodsReceivedNotes
            .Include(g => g.Items)
            .FirstOrDefaultAsync(g => g.Id == request.GrnId && g.OrganizationId == _currentUser.OrganizationId, ct)
            ?? throw new BusinessRuleException("Goods received note not found.");

        grn.Confirm();

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
