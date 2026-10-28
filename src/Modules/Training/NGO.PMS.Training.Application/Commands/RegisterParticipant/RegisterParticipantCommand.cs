using MediatR;

namespace NGO.PMS.Training.Application.Commands.RegisterParticipant;

public sealed record RegisterParticipantCommand(
    Guid TrainingSessionId,
    string FullName,
    Guid? ParticipantId) : IRequest<Guid>;
