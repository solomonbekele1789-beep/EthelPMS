using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.DeallocateInterventionArea;

public class DeallocateInterventionAreaCommandHandler : IRequestHandler<DeallocateInterventionAreaCommand>
{
    private readonly IProjectsDbContext _db;

    public DeallocateInterventionAreaCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task Handle(DeallocateInterventionAreaCommand request, CancellationToken ct)
    {
        var allocation = await _db.ProjectInterventionAreas
            .FirstOrDefaultAsync(pia => (pia.Id == request.AllocationId || pia.InterventionAreaId == request.AllocationId) && pia.ProjectId == request.ProjectId, ct)
            ?? throw new NotFoundException("ProjectInterventionArea", request.AllocationId);

        _db.ProjectInterventionAreas.Remove(allocation);
        await _db.SaveChangesAsync(ct);
    }
}
