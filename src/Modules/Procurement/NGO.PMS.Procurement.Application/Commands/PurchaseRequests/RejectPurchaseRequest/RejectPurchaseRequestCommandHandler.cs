using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseRequests.RejectPurchaseRequest;

public sealed class RejectPurchaseRequestCommandHandler : IRequestHandler<RejectPurchaseRequestCommand, Unit>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RejectPurchaseRequestCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Unit> Handle(RejectPurchaseRequestCommand request, CancellationToken ct)
    {
        var pr = await _db.PurchaseRequests
            .FirstOrDefaultAsync(p => p.Id == request.RequestId && p.OrganizationId == _currentUser.OrganizationId, ct)
            ?? throw new BusinessRuleException("Purchase request not found.");

        pr.Reject(request.Reason);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
