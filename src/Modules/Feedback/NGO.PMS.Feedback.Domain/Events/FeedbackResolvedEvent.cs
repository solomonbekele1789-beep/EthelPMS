using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Feedback.Domain.Events;

public sealed record FeedbackResolvedEvent(
    Guid FeedbackItemId,
    int ResolutionDays) : IDomainEvent;
