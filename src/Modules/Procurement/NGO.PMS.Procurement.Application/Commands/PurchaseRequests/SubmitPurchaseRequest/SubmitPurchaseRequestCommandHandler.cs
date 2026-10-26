using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseRequests.SubmitPurchaseRequest;

public sealed class SubmitPurchaseRequestCommandHandler : IRequestHandler<SubmitPurchaseRequestCommand, Unit>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SubmitPurchaseRequestCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Unit> Handle(SubmitPurchaseRequestCommand request, CancellationToken ct)
    {
        var pr = await _db.PurchaseRequests
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == request.RequestId && p.OrganizationId == _currentUser.OrganizationId, ct)
            ?? throw new BusinessRuleException("Purchase request not found.");

        pr.Submit();

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
