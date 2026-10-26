using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Domain.Events;

public sealed record MealPlanApprovedEvent(
    Guid MealPlanId,
    Guid ApprovedByUserId) : IDomainEvent;
