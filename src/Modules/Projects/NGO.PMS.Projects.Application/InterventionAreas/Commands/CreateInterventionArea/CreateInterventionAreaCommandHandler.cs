using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.CreateInterventionArea;

public class CreateInterventionAreaCommandHandler : IRequestHandler<CreateInterventionAreaCommand, Guid>
{
    private readonly IProjectsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateInterventionAreaCommandHandler(IProjectsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateInterventionAreaCommand request, CancellationToken ct)
    {
        var codeExists = await _db.InterventionAreas
            .AnyAsync(ia => ia.Code == request.Code.Trim()
                         && ia.OrganizationId == _currentUser.OrganizationId, ct);
        if (codeExists)
            throw new BusinessRuleException($"An intervention area with code '{request.Code}' already exists.");

        var level = 0;
        if (request.ParentId is not null)
        {
            var parent = await _db.InterventionAreas
                .FirstOrDefaultAsync(ia => ia.Id == request.ParentId.Value, ct)
                ?? throw new NotFoundException("InterventionArea (parent)", request.ParentId.Value);

            level = parent.Level + 1;
        }

        var interventionArea = InterventionArea.Create(
            request.Name, request.Code, _currentUser.OrganizationId, request.ParentId, level);

        _db.InterventionAreas.Add(interventionArea);
        await _db.SaveChangesAsync(ct);
        return interventionArea.Id;
    }
}
