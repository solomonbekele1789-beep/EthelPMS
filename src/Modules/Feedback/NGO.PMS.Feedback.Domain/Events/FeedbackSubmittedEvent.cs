using NGO.PMS.Feedback.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Feedback.Domain.Events;

public sealed record FeedbackSubmittedEvent(
    Guid FeedbackItemId,
    FeedbackType Type,
    bool IsAnonymous) : IDomainEvent;
