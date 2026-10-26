using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseOrders.IssuePurchaseOrder;

public sealed class IssuePurchaseOrderCommandHandler : IRequestHandler<IssuePurchaseOrderCommand, Unit>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public IssuePurchaseOrderCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Unit> Handle(IssuePurchaseOrderCommand request, CancellationToken ct)
    {
        var po = await _db.PurchaseOrders
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == request.PurchaseOrderId && p.OrganizationId == _currentUser.OrganizationId, ct)
            ?? throw new BusinessRuleException("Purchase order not found.");

        po.Issue();

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
