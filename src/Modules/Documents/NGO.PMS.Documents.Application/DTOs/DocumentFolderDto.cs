namespace NGO.PMS.Documents.Application.DTOs;

public class DocumentFolderDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid? ParentFolderId { get; set; }
    public string? Description { get; set; }
    public Guid? ProjectId { get; set; }
    public int SortOrder { get; set; }
    public int DocumentCount { get; set; }
    public List<DocumentFolderDto> SubFolders { get; set; } = [];
    public DateTimeOffset CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
}
