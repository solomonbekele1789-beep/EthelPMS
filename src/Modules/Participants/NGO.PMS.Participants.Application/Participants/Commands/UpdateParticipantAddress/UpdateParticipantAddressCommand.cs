using MediatR;

namespace NGO.PMS.Participants.Application.Participants.Commands.UpdateParticipantAddress;

public sealed record UpdateParticipantAddressCommand(
    Guid ParticipantId,
    string? Region,
    string? Zone,
    string? Woreda,
    string? Kebele,
    string? Address) : IRequest;
