using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Feedback;

/// <summary>
/// Fired when feedback is submitted.
/// Consumed by: Notifications (alert feedback officers), Hangfire (schedule auto-acknowledgement).
/// </summary>
public sealed record FeedbackSubmittedIntegrationEvent : IntegrationEvent
{
    public Guid FeedbackItemId { get; init; }
    public string FeedbackType { get; init; } = string.Empty;
    public bool IsAnonymous { get; init; }
}
