using MediatR;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseOrders.CreatePurchaseOrder;

public sealed class CreatePurchaseOrderCommandHandler : IRequestHandler<CreatePurchaseOrderCommand, Guid>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreatePurchaseOrderCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreatePurchaseOrderCommand request, CancellationToken ct)
    {
        var po = PurchaseOrder.Create(
            request.ReferenceNumber,
            request.PurchaseRequestId,
            request.SupplierId,
            _currentUser.OrganizationId);

        _db.PurchaseOrders.Add(po);
        await _db.SaveChangesAsync(ct);
        return po.Id;
    }
}
