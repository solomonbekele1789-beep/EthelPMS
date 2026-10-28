using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseRequests.ApprovePurchaseRequest;

public sealed class ApprovePurchaseRequestCommandHandler : IRequestHandler<ApprovePurchaseRequestCommand, Unit>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ApprovePurchaseRequestCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Unit> Handle(ApprovePurchaseRequestCommand request, CancellationToken ct)
    {
        var pr = await _db.PurchaseRequests
            .FirstOrDefaultAsync(p => p.Id == request.RequestId && p.OrganizationId == _currentUser.OrganizationId, ct)
            ?? throw new BusinessRuleException("Purchase request not found.");

        pr.Approve(_currentUser.UserId);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
