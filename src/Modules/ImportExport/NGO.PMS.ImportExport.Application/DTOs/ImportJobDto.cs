namespace NGO.PMS.ImportExport.Application.DTOs;

public class ImportJobDto
{
    public Guid Id { get; set; }
    public Guid? ImportTemplateId { get; set; }
    public string? TemplateName { get; set; }
    public Guid ImportedById { get; set; }
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string Module { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? TotalRows { get; set; }
    public int? ProcessedRows { get; set; }
    public int? SuccessRows { get; set; }
    public int? ErrorRows { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
