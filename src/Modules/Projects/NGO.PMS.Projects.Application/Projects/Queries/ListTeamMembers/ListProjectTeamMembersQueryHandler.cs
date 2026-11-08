using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Application.DTOs;

namespace NGO.PMS.Projects.Application.Projects.Queries.ListTeamMembers;

public class ListProjectTeamMembersQueryHandler : IRequestHandler<ListProjectTeamMembersQuery, List<ProjectTeamMemberDto>>
{
    private readonly IProjectsDbContext _db;

    public ListProjectTeamMembersQueryHandler(IProjectsDbContext db) => _db = db;

    public async Task<List<ProjectTeamMemberDto>> Handle(ListProjectTeamMembersQuery request, CancellationToken ct)
    {
        var members = await _db.ProjectTeamMembers
            .AsNoTracking()
            .Where(m => m.ProjectId == request.ProjectId && m.IsActive)
            .OrderBy(m => m.AssignedAt)
            .ToListAsync(ct);

        if (members.Count == 0) return [];

        var userIds = members.Select(m => m.UserId).Distinct().ToList();
        var users = await _db.ProjectUsers
            .AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, ct);

        return members.Select(m =>
        {
            users.TryGetValue(m.UserId, out var user);
            return new ProjectTeamMemberDto
            {
                Id = m.Id,
                ProjectId = m.ProjectId,
                UserId = m.UserId,
                Role = m.Role,
                FullName = user != null ? user.FullName : "Team Member",
                Email = user?.Email ?? string.Empty,
                AssignedAt = m.AssignedAt,
                IsActive = m.IsActive
            };
        }).ToList();
    }
}
