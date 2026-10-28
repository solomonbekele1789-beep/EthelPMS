namespace NGO.PMS.Feedback.Application.DTOs;

public class FeedbackResponseDto
{
    public Guid Id { get; set; }
    public Guid FeedbackItemId { get; set; }
    public Guid ResponderUserId { get; set; }
    public string ResponderName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
