using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Feedback.Domain.Events;

public sealed record FeedbackEscalatedEvent(
    Guid FeedbackItemId,
    string Reason) : IDomainEvent;
