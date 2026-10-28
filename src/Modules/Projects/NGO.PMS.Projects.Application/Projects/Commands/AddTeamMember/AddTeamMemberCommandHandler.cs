using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.Projects.Domain.Events;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.Projects.Commands.AddTeamMember;

public class AddTeamMemberCommandHandler : IRequestHandler<AddTeamMemberCommand, Guid>
{
    private readonly IProjectsDbContext _db;

    public AddTeamMemberCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task<Guid> Handle(AddTeamMemberCommand request, CancellationToken ct)
    {
        var project = await _db.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, ct)
            ?? throw new NotFoundException("Project", request.ProjectId);

        var alreadyMember = await _db.ProjectTeamMembers
            .AnyAsync(m => m.ProjectId == request.ProjectId
                        && m.UserId == request.UserId
                        && m.IsActive, ct);
        if (alreadyMember)
            throw new BusinessRuleException("User is already a team member of this project.");

        var member = ProjectTeamMember.Create(request.ProjectId, request.UserId, request.Role);
        _db.ProjectTeamMembers.Add(member);

        project.AddDomainEvent(new ProjectMemberAddedEvent(project.Id, request.UserId, request.Role));
        await _db.SaveChangesAsync(ct);
        return member.Id;
    }
}
