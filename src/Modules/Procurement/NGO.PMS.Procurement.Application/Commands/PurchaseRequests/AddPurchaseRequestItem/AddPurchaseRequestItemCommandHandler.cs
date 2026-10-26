using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseRequests.AddPurchaseRequestItem;

public sealed class AddPurchaseRequestItemCommandHandler : IRequestHandler<AddPurchaseRequestItemCommand, Guid>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddPurchaseRequestItemCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(AddPurchaseRequestItemCommand request, CancellationToken ct)
    {
        var pr = await _db.PurchaseRequests
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == request.RequestId && p.OrganizationId == _currentUser.OrganizationId, ct)
            ?? throw new BusinessRuleException("Purchase request not found.");

        var existingIds = pr.Items.Select(i => i.Id).ToHashSet();

        pr.AddItem(request.Description, request.Quantity, request.Unit, request.EstimatedUnitCost);

        var newItem = pr.Items.First(i => !existingIds.Contains(i.Id));

        await _db.SaveChangesAsync(ct);
        return newItem.Id;
    }
}
