namespace NGO.PMS.Participants.Application.DTOs;

public class ParticipantServiceDto
{
    public Guid Id { get; set; }
    public Guid ParticipantId { get; set; }
    public Guid ProjectId { get; set; }
    public Guid? ActivityId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset ServiceDate { get; set; }
    public decimal? Quantity { get; set; }
    public string? Unit { get; set; }
    public string? Notes { get; set; }
}
