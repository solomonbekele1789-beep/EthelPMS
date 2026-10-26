using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.KnowledgeMgmt.Domain.Entities;

public class KbArticleComment : AuditableEntity, IMultiTenant
{
    public Guid OrganizationId { get; private set; }
    public Guid ArticleId { get; private set; }
    public Guid AuthorId { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public Guid? ParentCommentId { get; private set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    // Navigation
    public KbArticleComment? ParentComment { get; private set; }

    private readonly List<KbArticleComment> _replies = [];
    public IReadOnlyList<KbArticleComment> Replies => _replies.AsReadOnly();

    private KbArticleComment() { }

    public static KbArticleComment Create(Guid organizationId, Guid articleId, Guid authorId,
        string content, Guid? parentCommentId)
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Comment content is required.", nameof(content));

        return new KbArticleComment
        {
            OrganizationId = organizationId,
            ArticleId = articleId,
            AuthorId = authorId,
            Content = content,
            ParentCommentId = parentCommentId
        };
    }
}
