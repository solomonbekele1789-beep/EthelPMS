namespace NGO.PMS.ImportExport.Application.DTOs;

public class ExportJobDto
{
    public Guid Id { get; set; }
    public Guid ExportedById { get; set; }
    public string Module { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string ExportFormat { get; set; } = string.Empty;
    public string? FileName { get; set; }
    public long? FileSize { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? TotalRecords { get; set; }
    public DateTime? CompletedAt { get; set; }
}
