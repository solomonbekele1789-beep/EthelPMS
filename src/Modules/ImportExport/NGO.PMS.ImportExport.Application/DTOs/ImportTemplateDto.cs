namespace NGO.PMS.ImportExport.Application.DTOs;

public class ImportTemplateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string FileFormat { get; set; } = string.Empty;
    public string ColumnMappings { get; set; } = string.Empty;
    public bool IsSystemTemplate { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
