using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Training.Domain.Events;

public sealed record TrainingSessionCompletedEvent(
    Guid SessionId,
    Guid ProgramId,
    int AttendeeCount) : IDomainEvent;
