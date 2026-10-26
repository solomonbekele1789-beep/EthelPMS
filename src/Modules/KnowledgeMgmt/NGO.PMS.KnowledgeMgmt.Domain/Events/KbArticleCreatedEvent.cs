using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.KnowledgeMgmt.Domain.Events;

public sealed record KbArticleCreatedEvent(Guid ArticleId, Guid OrganizationId, string Title) : IDomainEvent;
