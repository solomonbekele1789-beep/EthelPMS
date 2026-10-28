using MediatR;

namespace NGO.PMS.Participants.Application.Participants.Commands.AddHouseholdMember;

public sealed record AddHouseholdMemberCommand(
    string HouseholdCode,
    Guid ParticipantId,
    bool IsHeadOfHousehold,
    string? RelationshipToHead,
    int? HouseholdSize) : IRequest<Guid>;
