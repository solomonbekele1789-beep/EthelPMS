using NGO.PMS.Documents.Domain.Enums;
using NGO.PMS.Documents.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Documents.Domain.Entities;

public class Document : AuditableEntity, IMultiTenant, ISoftDeletable
{
    public Guid? FolderId { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string? DisplayName { get; private set; }
    public string? Description { get; private set; }
    public DocumentStatus Status { get; private set; }
    public DocumentCategory Category { get; private set; }
    public string ContentType { get; private set; } = string.Empty;
    public long FileSizeBytes { get; private set; }
    public int CurrentVersion { get; private set; }
    public string? Tags { get; private set; }
    public Guid? LinkedEntityId { get; private set; }
    public string? LinkedEntityType { get; private set; }
    public Guid TenantId { get; set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public List<DocumentVersion> Versions { get; private set; } = [];
    public List<DocumentComment> Comments { get; private set; } = [];

    private Document() { }

    public static Document Create(
        string fileName,
        string contentType,
        long fileSizeBytes,
        Guid tenantId,
        Guid? folderId = null,
        string? displayName = null,
        string? description = null,
        DocumentCategory category = DocumentCategory.General,
        string? tags = null,
        Guid? linkedEntityId = null,
        string? linkedEntityType = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(fileName);

        var doc = new Document
        {
            FileName = fileName,
            ContentType = contentType,
            FileSizeBytes = fileSizeBytes,
            TenantId = tenantId,
            FolderId = folderId,
            DisplayName = displayName,
            Description = description,
            Status = DocumentStatus.Draft,
            Category = category,
            CurrentVersion = 1,
            Tags = tags,
            LinkedEntityId = linkedEntityId,
            LinkedEntityType = linkedEntityType
        };

        doc.AddDomainEvent(new DocumentUploadedEvent(doc.Id, fileName, 1));
        return doc;
    }

    public void UpdateMetadata(
        string? displayName,
        string? description,
        DocumentCategory category,
        string? tags,
        Guid? linkedEntityId,
        string? linkedEntityType)
    {
        DisplayName = displayName;
        Description = description;
        Category = category;
        Tags = tags;
        LinkedEntityId = linkedEntityId;
        LinkedEntityType = linkedEntityType;
    }

    public void Publish()
    {
        Status = DocumentStatus.Published;
    }

    public void Archive()
    {
        Status = DocumentStatus.Archived;
    }

    public void IncrementVersion(long fileSizeBytes, string contentType)
    {
        CurrentVersion++;
        FileSizeBytes = fileSizeBytes;
        ContentType = contentType;
    }
}
