using MediatR;

namespace NGO.PMS.Training.Application.Commands.CreateTrainingSession;

public sealed record CreateTrainingSessionCommand(
    Guid TrainingProgramId,
    string Title,
    DateTime ScheduledDate,
    string? Venue,
    DateTime? EndDate,
    int? MaxParticipants,
    string? Notes) : IRequest<Guid>;
