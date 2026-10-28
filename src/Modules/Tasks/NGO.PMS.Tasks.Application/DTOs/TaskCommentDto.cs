namespace NGO.PMS.Tasks.Application.DTOs;

public class TaskCommentDto
{
    public Guid Id { get; set; }
    public Guid TaskItemId { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid AuthorUserId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public Guid? ParentCommentId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
}
