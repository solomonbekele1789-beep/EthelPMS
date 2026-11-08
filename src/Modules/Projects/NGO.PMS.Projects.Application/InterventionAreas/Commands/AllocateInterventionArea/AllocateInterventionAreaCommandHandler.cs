using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.AllocateInterventionArea;

public class AllocateInterventionAreaCommandHandler : IRequestHandler<AllocateInterventionAreaCommand, Guid>
{
    private readonly IProjectsDbContext _db;

    public AllocateInterventionAreaCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task<Guid> Handle(AllocateInterventionAreaCommand request, CancellationToken ct)
    {
        var projectExists = await _db.Projects
            .AnyAsync(p => p.Id == request.ProjectId, ct);
        if (!projectExists)
            throw new NotFoundException("Project", request.ProjectId);

        var iaExists = await _db.InterventionAreas
            .AnyAsync(ia => ia.Id == request.InterventionAreaId, ct);
        if (!iaExists)
            throw new NotFoundException("InterventionArea", request.InterventionAreaId);

        var existing = await _db.ProjectInterventionAreas
            .FirstOrDefaultAsync(pia => pia.ProjectId == request.ProjectId
                                     && pia.InterventionAreaId == request.InterventionAreaId, ct);

        if (existing is not null)
        {
            existing.UpdateBudget(request.BudgetAllocated, request.BudgetPercentage);
            existing.UpdateBeneficiaries(
                request.DirectBeneficiariesMale,
                request.DirectBeneficiariesFemale,
                request.IndirectBeneficiariesMale,
                request.IndirectBeneficiariesFemale
            );
            await _db.SaveChangesAsync(ct);
            return existing.Id;
        }

        var allocation = ProjectInterventionArea.Create(
            request.ProjectId, request.InterventionAreaId,
            request.BudgetAllocated, request.BudgetPercentage);

        allocation.UpdateBeneficiaries(
            request.DirectBeneficiariesMale,
            request.DirectBeneficiariesFemale,
            request.IndirectBeneficiariesMale,
            request.IndirectBeneficiariesFemale
        );

        _db.ProjectInterventionAreas.Add(allocation);
        await _db.SaveChangesAsync(ct);
        return allocation.Id;
    }
}
