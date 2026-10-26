namespace NGO.PMS.Documents.Application.DTOs;

public class FolderTreeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid? ParentFolderId { get; set; }
    public List<FolderTreeDto> Children { get; set; } = [];
}
