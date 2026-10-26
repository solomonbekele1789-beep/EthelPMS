namespace NGO.PMS.KnowledgeMgmt.Application.DTOs;

public class KbArticleDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public Guid AuthorId { get; set; }
    public string Tags { get; set; } = string.Empty;
    public Guid? LinkedProjectId { get; set; }
    public Guid? LinkedEvaluationId { get; set; }
    public string ArticleType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public int ViewCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
