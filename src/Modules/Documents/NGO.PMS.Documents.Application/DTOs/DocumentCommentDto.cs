namespace NGO.PMS.Documents.Application.DTOs;

public class DocumentCommentDto
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public Guid AuthorUserId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public Guid? ParentCommentId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
