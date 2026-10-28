using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Organizations.Commands.UpdateOrganization;

public class UpdateOrganizationCommandHandler : IRequestHandler<UpdateOrganizationCommand>
{
    private readonly IIdentityDbContext _db;
    private readonly ICurrentUserService _currentUser;
    public UpdateOrganizationCommandHandler(IIdentityDbContext db, ICurrentUserService currentUser) { _db = db; _currentUser = currentUser; }

    public async Task Handle(UpdateOrganizationCommand request, CancellationToken cancellationToken)
    {
        var org = await _db.Organizations.FirstOrDefaultAsync(o => o.Id == _currentUser.OrganizationId, cancellationToken)
            ?? throw new NotFoundException("Organization", _currentUser.OrganizationId);
        org.Update(request.Name, request.LogoUrl, request.Timezone, request.CalendarPreference);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
