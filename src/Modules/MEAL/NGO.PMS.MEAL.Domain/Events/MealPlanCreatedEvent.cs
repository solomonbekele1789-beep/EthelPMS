using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Domain.Events;

public sealed record MealPlanCreatedEvent(
    Guid MealPlanId,
    Guid ProjectId) : IDomainEvent;
