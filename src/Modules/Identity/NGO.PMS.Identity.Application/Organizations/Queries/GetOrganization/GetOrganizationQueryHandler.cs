using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application.Organizations.DTOs;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Organizations.Queries.GetOrganization;

public class GetOrganizationQueryHandler : IRequestHandler<GetOrganizationQuery, OrganizationDto>
{
    private readonly IIdentityDbContext _db;
    private readonly ICurrentUserService _currentUser;
    public GetOrganizationQueryHandler(IIdentityDbContext db, ICurrentUserService currentUser) { _db = db; _currentUser = currentUser; }

    public async Task<OrganizationDto> Handle(GetOrganizationQuery request, CancellationToken cancellationToken)
    {
        var org = await _db.Organizations.FirstOrDefaultAsync(o => o.Id == _currentUser.OrganizationId, cancellationToken)
            ?? throw new NotFoundException("Organization", _currentUser.OrganizationId);

        var userCount = await _db.Users.CountAsync(u => u.OrganizationId == _currentUser.OrganizationId, cancellationToken);
        var officeCount = await _db.Offices.CountAsync(o => o.OrganizationId == _currentUser.OrganizationId, cancellationToken);

        return new OrganizationDto(org.Id, org.Name, org.Slug, org.LogoUrl, org.Timezone,
            org.CalendarPreference.ToString(), userCount, officeCount);
    }
}
