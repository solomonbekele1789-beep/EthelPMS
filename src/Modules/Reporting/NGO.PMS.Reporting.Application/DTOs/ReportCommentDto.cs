namespace NGO.PMS.Reporting.Application.DTOs;

public class ReportCommentDto
{
    public Guid Id { get; set; }
    public Guid ReportId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid? ParentCommentId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public List<ReportCommentDto> Replies { get; set; } = [];
}
