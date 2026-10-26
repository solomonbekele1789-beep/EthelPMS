using MediatR;
using NGO.PMS.Participants.Application.DTOs;

namespace NGO.PMS.Participants.Application.Participants.Queries.ListHouseholdMembers;

public sealed record ListHouseholdMembersQuery(string HouseholdCode) : IRequest<List<HouseholdMemberDto>>;
