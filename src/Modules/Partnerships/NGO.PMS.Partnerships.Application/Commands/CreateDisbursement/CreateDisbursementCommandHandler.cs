using MediatR;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.Partnerships.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Partnerships.Application.Commands.CreateDisbursement;

public sealed class CreateDisbursementCommandHandler : IRequestHandler<CreateDisbursementCommand, Guid>
{
    private readonly IPartnershipsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateDisbursementCommandHandler(IPartnershipsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateDisbursementCommand request, CancellationToken ct)
    {
        var disbursement = Disbursement.Create(
            _currentUser.OrganizationId,
            request.SubGranteeId,
            request.GrantId,
            request.Amount,
            request.Currency,
            request.DisbursementDate,
            request.ReferenceNumber,
            request.Purpose);

        _db.Disbursements.Add(disbursement);
        await _db.SaveChangesAsync(ct);
        return disbursement.Id;
    }
}
