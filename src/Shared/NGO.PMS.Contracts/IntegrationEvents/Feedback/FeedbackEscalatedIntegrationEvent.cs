using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Feedback;

/// <summary>
/// Fired when feedback is escalated (especially safeguarding concerns).
/// Consumed by: Notifications (alert management + safeguarding focal point).
/// </summary>
public sealed record FeedbackEscalatedIntegrationEvent : IntegrationEvent
{
    public Guid FeedbackItemId { get; init; }
    public string Reason { get; init; } = string.Empty;
}
