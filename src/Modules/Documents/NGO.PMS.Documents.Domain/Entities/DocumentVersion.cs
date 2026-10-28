using NGO.PMS.Documents.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Documents.Domain.Entities;

public class DocumentVersion : AuditableEntity, IMultiTenant
{
    public Guid DocumentId { get; private set; }
    public int VersionNumber { get; private set; }
    public string StorageUrl { get; private set; } = string.Empty;
    public long FileSizeBytes { get; private set; }
    public string ContentType { get; private set; } = string.Empty;
    public string? ChangeNotes { get; private set; }
    public Guid UploadedByUserId { get; private set; }
    public string UploadedByName { get; private set; } = string.Empty;
    public Guid TenantId { get; set; }

    private DocumentVersion() { }

    public static DocumentVersion Create(
        Guid documentId,
        int versionNumber,
        string storageUrl,
        long fileSizeBytes,
        string contentType,
        Guid uploadedByUserId,
        string uploadedByName,
        Guid tenantId,
        string? changeNotes = null)
    {
        var version = new DocumentVersion
        {
            DocumentId = documentId,
            VersionNumber = versionNumber,
            StorageUrl = storageUrl,
            FileSizeBytes = fileSizeBytes,
            ContentType = contentType,
            UploadedByUserId = uploadedByUserId,
            UploadedByName = uploadedByName,
            TenantId = tenantId,
            ChangeNotes = changeNotes
        };

        version.AddDomainEvent(new DocumentVersionCreatedEvent(documentId, version.Id, versionNumber));
        return version;
    }
}
