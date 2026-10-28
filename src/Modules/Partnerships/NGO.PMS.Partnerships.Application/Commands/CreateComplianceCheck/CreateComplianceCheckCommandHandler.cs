using MediatR;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.Partnerships.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Partnerships.Application.Commands.CreateComplianceCheck;

public sealed class CreateComplianceCheckCommandHandler : IRequestHandler<CreateComplianceCheckCommand, Guid>
{
    private readonly IPartnershipsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateComplianceCheckCommandHandler(IPartnershipsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateComplianceCheckCommand request, CancellationToken ct)
    {
        var compliance = PartnerCompliance.Create(
            _currentUser.OrganizationId,
            request.SubGranteeId,
            request.ComplianceType,
            request.CheckDate,
            request.AssessorId);

        _db.PartnerCompliances.Add(compliance);
        await _db.SaveChangesAsync(ct);
        return compliance.Id;
    }
}
