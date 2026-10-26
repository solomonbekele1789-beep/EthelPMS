using MediatR;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Application.Commands.PurchaseRequests.CreatePurchaseRequest;

public sealed class CreatePurchaseRequestCommandHandler : IRequestHandler<CreatePurchaseRequestCommand, Guid>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreatePurchaseRequestCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreatePurchaseRequestCommand request, CancellationToken ct)
    {
        var pr = PurchaseRequest.Create(
            request.ReferenceNumber,
            request.ProjectId,
            request.Justification,
            request.Method,
            _currentUser.OrganizationId);

        _db.PurchaseRequests.Add(pr);
        await _db.SaveChangesAsync(ct);
        return pr.Id;
    }
}
