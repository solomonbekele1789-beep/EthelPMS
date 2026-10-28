using MediatR;

namespace NGO.PMS.Projects.Application.Projects.Commands.RemoveTeamMember;

public record RemoveTeamMemberCommand(Guid ProjectId, Guid MemberId) : IRequest;
