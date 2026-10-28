using NGO.PMS.KnowledgeMgmt.Domain.Enums;
using NGO.PMS.KnowledgeMgmt.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.KnowledgeMgmt.Domain.Entities;

public class KbArticle : AuditableEntity, ISoftDeletable, IMultiTenant
{
    public Guid OrganizationId { get; private set; }
    public Guid CategoryId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public string? Summary { get; private set; }
    public Guid AuthorId { get; private set; }
    public string Tags { get; private set; } = string.Empty;
    public Guid? LinkedProjectId { get; private set; }
    public Guid? LinkedEvaluationId { get; private set; }
    public ArticleType ArticleType { get; private set; }
    public ArticleStatus Status { get; private set; }
    public bool IsFeatured { get; private set; }
    public int ViewCount { get; private set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    // Navigation
    public KbCategory Category { get; private set; } = null!;

    private readonly List<KbArticleComment> _comments = [];
    public IReadOnlyList<KbArticleComment> Comments => _comments.AsReadOnly();

    private KbArticle() { }

    public static KbArticle Create(Guid organizationId, Guid categoryId, string title, string content,
        string? summary, Guid authorId, string? tags, Guid? linkedProjectId,
        Guid? linkedEvaluationId, ArticleType articleType)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Article title is required.", nameof(title));
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Article content is required.", nameof(content));

        var article = new KbArticle
        {
            OrganizationId = organizationId,
            CategoryId = categoryId,
            Title = title,
            Content = content,
            Summary = summary,
            AuthorId = authorId,
            Tags = tags ?? string.Empty,
            LinkedProjectId = linkedProjectId,
            LinkedEvaluationId = linkedEvaluationId,
            ArticleType = articleType,
            Status = ArticleStatus.Draft,
            IsFeatured = false,
            ViewCount = 0
        };

        article.AddDomainEvent(new KbArticleCreatedEvent(article.Id, organizationId, title));

        return article;
    }

    public void Update(Guid categoryId, string title, string content,
        string? summary, string? tags, bool? isFeatured)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Article title is required.", nameof(title));
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Article content is required.", nameof(content));

        CategoryId = categoryId;
        Title = title;
        Content = content;
        Summary = summary;
        Tags = tags ?? string.Empty;
        if (isFeatured.HasValue)
            IsFeatured = isFeatured.Value;
    }

    public void Publish()
    {
        if (string.IsNullOrWhiteSpace(Title))
            throw new InvalidOperationException("Cannot publish an article without a title.");
        if (string.IsNullOrWhiteSpace(Content))
            throw new InvalidOperationException("Cannot publish an article without content.");

        Status = ArticleStatus.Published;
        AddDomainEvent(new KbArticlePublishedEvent(Id, OrganizationId, Title));
    }

    public void Archive()
    {
        Status = ArticleStatus.Archived;
    }

    public void IncrementViewCount()
    {
        ViewCount++;
    }
}
