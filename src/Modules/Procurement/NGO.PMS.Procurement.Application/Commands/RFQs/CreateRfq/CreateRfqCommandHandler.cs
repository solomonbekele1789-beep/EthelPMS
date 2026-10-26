using MediatR;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Application.Commands.RFQs.CreateRfq;

public sealed class CreateRfqCommandHandler : IRequestHandler<CreateRfqCommand, Guid>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateRfqCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateRfqCommand request, CancellationToken ct)
    {
        var rfq = RequestForQuotation.Create(
            request.ReferenceNumber,
            request.PurchaseRequestId,
            request.Deadline,
            _currentUser.OrganizationId);

        _db.RequestForQuotations.Add(rfq);
        await _db.SaveChangesAsync(ct);
        return rfq.Id;
    }
}
