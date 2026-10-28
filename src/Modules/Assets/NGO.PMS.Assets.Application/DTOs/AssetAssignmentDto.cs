namespace NGO.PMS.Assets.Application.DTOs;

public class AssetAssignmentDto
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public Guid AssignedToUserId { get; set; }
    public string AssignedToName { get; set; } = string.Empty;
    public DateTime AssignmentDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public string? Notes { get; set; }
}
