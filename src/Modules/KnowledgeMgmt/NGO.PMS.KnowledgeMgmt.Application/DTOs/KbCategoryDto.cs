namespace NGO.PMS.KnowledgeMgmt.Application.DTOs;

public class KbCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentCategoryId { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public int ChildCount { get; set; }
}
