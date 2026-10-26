namespace NGO.PMS.Tasks.Application.DTOs;

public class TaskApprovalLogDto
{
    public Guid Id { get; set; }
    public Guid TaskItemId { get; set; }
    public Guid ApproverId { get; set; }
    public string ApproverName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? Comments { get; set; }
    public int ApprovalLevel { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
