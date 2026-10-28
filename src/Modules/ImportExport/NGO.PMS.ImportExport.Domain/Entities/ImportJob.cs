using NGO.PMS.ImportExport.Domain.Enums;
using NGO.PMS.ImportExport.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.ImportExport.Domain.Entities;

public class ImportJob : AuditableEntity, IMultiTenant
{
    public Guid OrganizationId { get; private set; }
    public Guid? ImportTemplateId { get; private set; }
    public Guid ImportedById { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public long FileSize { get; private set; }
    public string FileStoragePath { get; private set; } = string.Empty;
    public string Module { get; private set; } = string.Empty;
    public string EntityType { get; private set; } = string.Empty;
    public ImportJobStatus Status { get; private set; }
    public int? TotalRows { get; private set; }
    public int? ProcessedRows { get; private set; }
    public int? SuccessRows { get; private set; }
    public int? ErrorRows { get; private set; }
    public string? ErrorLog { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private ImportJob() { }

    public static ImportJob Create(
        Guid organizationId,
        Guid importedById,
        Guid? importTemplateId,
        string fileName,
        long fileSize,
        string fileStoragePath,
        string module,
        string entityType)
    {
        var job = new ImportJob
        {
            OrganizationId = organizationId,
            ImportedById = importedById,
            ImportTemplateId = importTemplateId,
            FileName = fileName,
            FileSize = fileSize,
            FileStoragePath = fileStoragePath,
            Module = module,
            EntityType = entityType,
            Status = ImportJobStatus.Pending
        };

        job.AddDomainEvent(new ImportJobCreatedEvent(job.Id, organizationId, module, entityType));
        return job;
    }

    public void StartValidation()
    {
        Status = ImportJobStatus.Validating;
    }

    public void MarkValidated(int totalRows)
    {
        Status = ImportJobStatus.Validated;
        TotalRows = totalRows;
    }

    public void StartProcessing()
    {
        Status = ImportJobStatus.Processing;
        StartedAt = DateTime.UtcNow;
    }

    public void RecordProgress(int processed, int success, int errors)
    {
        ProcessedRows = processed;
        SuccessRows = success;
        ErrorRows = errors;
    }

    public void Complete(string? errorLog = null)
    {
        Status = (ErrorRows ?? 0) > 0 ? ImportJobStatus.CompletedWithErrors : ImportJobStatus.Completed;
        ErrorLog = errorLog;
        CompletedAt = DateTime.UtcNow;

        AddDomainEvent(new ImportJobCompletedEvent(Id, OrganizationId, SuccessRows ?? 0, ErrorRows ?? 0));
    }

    public void Fail(string errorLog)
    {
        Status = ImportJobStatus.Failed;
        ErrorLog = errorLog;
        CompletedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        Status = ImportJobStatus.Cancelled;
        CompletedAt = DateTime.UtcNow;
    }
}
