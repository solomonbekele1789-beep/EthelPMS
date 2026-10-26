using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.UpdateInterventionArea;

public class UpdateInterventionAreaCommandHandler : IRequestHandler<UpdateInterventionAreaCommand>
{
    private readonly IProjectsDbContext _db;

    public UpdateInterventionAreaCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task Handle(UpdateInterventionAreaCommand request, CancellationToken ct)
    {
        var interventionArea = await _db.InterventionAreas
            .FirstOrDefaultAsync(ia => ia.Id == request.InterventionAreaId, ct)
            ?? throw new NotFoundException("InterventionArea", request.InterventionAreaId);

        interventionArea.Update(request.Name, request.Description, request.SortOrder);

        await _db.SaveChangesAsync(ct);
    }
}
