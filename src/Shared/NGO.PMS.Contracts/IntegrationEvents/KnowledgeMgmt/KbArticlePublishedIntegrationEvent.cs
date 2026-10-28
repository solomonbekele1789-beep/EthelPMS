using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.KnowledgeMgmt;

/// <summary>
/// Published when a knowledge-base article is published.
/// Consumed by: Notifications, Dashboards.
/// </summary>
public sealed record KbArticlePublishedIntegrationEvent : IntegrationEvent
{
    public Guid ArticleId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string ArticleType { get; init; } = string.Empty;
}
