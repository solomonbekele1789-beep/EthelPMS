namespace NGO.PMS.KnowledgeMgmt.Application.DTOs;

public class KbArticleCommentDto
{
    public Guid Id { get; set; }
    public Guid ArticleId { get; set; }
    public Guid AuthorId { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid? ParentCommentId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
