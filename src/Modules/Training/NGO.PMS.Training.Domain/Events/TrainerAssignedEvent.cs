using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Training.Domain.Events;

public sealed record TrainerAssignedEvent(
    Guid TrainerId,
    Guid SessionId) : IDomainEvent;
