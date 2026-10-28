namespace NGO.PMS.ImportExport.Application.DTOs;

public class ImportJobListDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? TotalRows { get; set; }
    public int? SuccessRows { get; set; }
    public int? ErrorRows { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
