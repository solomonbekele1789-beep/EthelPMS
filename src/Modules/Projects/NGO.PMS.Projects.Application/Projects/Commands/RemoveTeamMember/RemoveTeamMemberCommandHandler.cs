using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.Projects.Commands.RemoveTeamMember;

public class RemoveTeamMemberCommandHandler : IRequestHandler<RemoveTeamMemberCommand>
{
    private readonly IProjectsDbContext _db;

    public RemoveTeamMemberCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task Handle(RemoveTeamMemberCommand request, CancellationToken ct)
    {
        var member = await _db.ProjectTeamMembers
            .FirstOrDefaultAsync(m => m.Id == request.MemberId
                                   && m.ProjectId == request.ProjectId
                                   && m.IsActive, ct)
            ?? throw new NotFoundException("TeamMember", request.MemberId);

        member.Remove();
        await _db.SaveChangesAsync(ct);
    }
}
