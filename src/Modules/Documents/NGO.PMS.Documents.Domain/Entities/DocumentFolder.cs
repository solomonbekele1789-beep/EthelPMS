using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Documents.Domain.Entities;

public class DocumentFolder : AuditableEntity, IMultiTenant, ISoftDeletable
{
    public string Name { get; private set; } = string.Empty;
    public Guid? ParentFolderId { get; private set; }
    public string? Description { get; private set; }
    public Guid? ProjectId { get; private set; }
    public int SortOrder { get; private set; }
    public Guid TenantId { get; set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public List<DocumentFolder> SubFolders { get; private set; } = [];
    public List<Document> Documents { get; private set; } = [];

    private DocumentFolder() { }

    public static DocumentFolder Create(
        string name,
        Guid tenantId,
        Guid? parentFolderId = null,
        string? description = null,
        Guid? projectId = null,
        int sortOrder = 0)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        return new DocumentFolder
        {
            Name = name,
            TenantId = tenantId,
            ParentFolderId = parentFolderId,
            Description = description,
            ProjectId = projectId,
            SortOrder = sortOrder
        };
    }

    public void Update(string name, string? description)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        Name = name;
        Description = description;
    }

    public void MoveTo(Guid? parentFolderId)
    {
        ParentFolderId = parentFolderId;
    }
}
