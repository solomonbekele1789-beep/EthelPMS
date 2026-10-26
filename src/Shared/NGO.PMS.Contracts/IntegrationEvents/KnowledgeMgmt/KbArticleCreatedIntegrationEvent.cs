using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.KnowledgeMgmt;

/// <summary>
/// Published when a new knowledge-base article is created.
/// Consumed by: Notifications.
/// </summary>
public sealed record KbArticleCreatedIntegrationEvent : IntegrationEvent
{
    public Guid ArticleId { get; init; }
    public string Title { get; init; } = string.Empty;
}
