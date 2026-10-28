using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Commands.RFQs.SubmitRfqResponse;

public sealed class SubmitRfqResponseCommandHandler : IRequestHandler<SubmitRfqResponseCommand, Guid>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SubmitRfqResponseCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(SubmitRfqResponseCommand request, CancellationToken ct)
    {
        var rfq = await _db.RequestForQuotations
            .FirstOrDefaultAsync(r => r.Id == request.RfqId && r.OrganizationId == _currentUser.OrganizationId, ct)
            ?? throw new BusinessRuleException("RFQ not found.");

        var response = RfqResponse.Create(
            request.RfqId,
            request.SupplierId,
            request.TotalQuotedAmount,
            request.DeliveryDays,
            _currentUser.OrganizationId);

        _db.RfqResponses.Add(response);
        await _db.SaveChangesAsync(ct);
        return response.Id;
    }
}
