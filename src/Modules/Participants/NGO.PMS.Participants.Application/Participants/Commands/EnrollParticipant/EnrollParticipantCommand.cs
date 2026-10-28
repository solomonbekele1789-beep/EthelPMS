using MediatR;

namespace NGO.PMS.Participants.Application.Participants.Commands.EnrollParticipant;

public sealed record EnrollParticipantCommand(
    Guid ParticipantId,
    Guid ProjectId,
    string? CohortName) : IRequest<Guid>;
