namespace NGO.PMS.Documents.Application.DTOs;

public class DocumentDto
{
    public Guid Id { get; set; }
    public Guid? FolderId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public int CurrentVersion { get; set; }
    public string? Tags { get; set; }
    public Guid? LinkedEntityId { get; set; }
    public string? LinkedEntityType { get; set; }
    public int VersionCount { get; set; }
    public DocumentVersionDto? LatestVersion { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
}
