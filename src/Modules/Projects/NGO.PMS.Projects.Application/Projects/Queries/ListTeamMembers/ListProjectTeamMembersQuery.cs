using MediatR;
using NGO.PMS.Projects.Application.DTOs;

namespace NGO.PMS.Projects.Application.Projects.Queries.ListTeamMembers;

public record ListProjectTeamMembersQuery(Guid ProjectId) : IRequest<List<ProjectTeamMemberDto>>;
