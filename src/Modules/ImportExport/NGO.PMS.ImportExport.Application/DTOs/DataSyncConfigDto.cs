namespace NGO.PMS.ImportExport.Application.DTOs;

public class DataSyncConfigDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SourceType { get; set; } = string.Empty;
    public string SourceUrl { get; set; } = string.Empty;
    public string? FormId { get; set; }
    public string TargetModule { get; set; } = string.Empty;
    public string TargetEntityType { get; set; } = string.Empty;
    public string? SyncFrequency { get; set; }
    public DateTime? LastSyncAt { get; set; }
    public bool IsActive { get; set; }
}
