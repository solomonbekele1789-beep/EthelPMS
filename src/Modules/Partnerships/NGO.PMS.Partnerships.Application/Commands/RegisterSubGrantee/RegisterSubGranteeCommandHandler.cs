using MediatR;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.Partnerships.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Partnerships.Application.Commands.RegisterSubGrantee;

public sealed class RegisterSubGranteeCommandHandler : IRequestHandler<RegisterSubGranteeCommand, Guid>
{
    private readonly IPartnershipsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RegisterSubGranteeCommandHandler(IPartnershipsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(RegisterSubGranteeCommand request, CancellationToken ct)
    {
        var entity = SubGrantee.Create(
            _currentUser.OrganizationId,
            request.Name,
            request.ContactPerson,
            request.ContactEmail,
            request.ContactPhone,
            request.Country,
            request.PartnerType,
            request.RegistrationNumber,
            request.Address);

        _db.SubGrantees.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity.Id;
    }
}
