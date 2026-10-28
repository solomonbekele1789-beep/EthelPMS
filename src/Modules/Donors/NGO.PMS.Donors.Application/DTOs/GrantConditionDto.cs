namespace NGO.PMS.Donors.Application.DTOs;

public class GrantConditionDto
{
    public Guid Id { get; set; }
    public Guid GrantId { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? CompletionNotes { get; set; }
    public DateTime? CompletedDate { get; set; }
}
