using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Documents.Domain.Entities;

public class DocumentComment : AuditableEntity, IMultiTenant
{
    public Guid DocumentId { get; private set; }
    public Guid AuthorUserId { get; private set; }
    public string AuthorName { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public Guid? ParentCommentId { get; private set; }
    public Guid TenantId { get; set; }

    private DocumentComment() { }

    public static DocumentComment Create(
        Guid documentId,
        string content,
        Guid authorUserId,
        string authorName,
        Guid tenantId,
        Guid? parentCommentId = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(content);

        return new DocumentComment
        {
            DocumentId = documentId,
            Content = content,
            AuthorUserId = authorUserId,
            AuthorName = authorName,
            TenantId = tenantId,
            ParentCommentId = parentCommentId
        };
    }

    public void Edit(string content, Guid editorUserId)
    {
        if (AuthorUserId != editorUserId)
            throw new InvalidOperationException("Only the author can edit this comment.");

        ArgumentException.ThrowIfNullOrWhiteSpace(content);
        Content = content;
    }
}
