using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.DeleteInterventionArea;

public class DeleteInterventionAreaCommandHandler : IRequestHandler<DeleteInterventionAreaCommand>
{
    private readonly IProjectsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DeleteInterventionAreaCommandHandler(IProjectsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteInterventionAreaCommand request, CancellationToken ct)
    {
        var area = await _db.InterventionAreas
            .Include(ia => ia.Children)
            .Include(ia => ia.ProjectAllocations)
            .FirstOrDefaultAsync(ia => ia.Id == request.InterventionAreaId && ia.OrganizationId == _currentUser.OrganizationId && !ia.IsDeleted, ct)
            ?? throw new NotFoundException("InterventionArea", request.InterventionAreaId);

        if (area.Children.Any(c => !c.IsDeleted))
        {
            throw new BusinessRuleException("Cannot delete an intervention area that has sub-areas. Please delete or move child areas first.");
        }

        if (area.ProjectAllocations.Count > 0)
        {
            throw new BusinessRuleException("Cannot delete an intervention area that has active project allocations.");
        }

        area.IsDeleted = true;
        area.DeletedAt = DateTimeOffset.UtcNow;
        area.DeletedBy = _currentUser.UserId.ToString();

        await _db.SaveChangesAsync(ct);
    }
}
