using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Domain.Events;

public sealed record EvaluationCompletedEvent(
    Guid EvaluationId,
    Guid ProjectId) : IDomainEvent;
