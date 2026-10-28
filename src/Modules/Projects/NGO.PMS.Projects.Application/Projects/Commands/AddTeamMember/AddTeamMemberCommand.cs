using MediatR;

namespace NGO.PMS.Projects.Application.Projects.Commands.AddTeamMember;

public record AddTeamMemberCommand(Guid ProjectId, Guid UserId, string Role) : IRequest<Guid>;
