using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.KnowledgeMgmt.Domain.Events;

public sealed record KbArticlePublishedEvent(Guid ArticleId, Guid OrganizationId, string Title) : IDomainEvent;
