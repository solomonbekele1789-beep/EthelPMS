using NGO.PMS.ImportExport.Domain.Enums;
using NGO.PMS.ImportExport.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.ImportExport.Domain.Entities;

public class ExportJob : AuditableEntity, IMultiTenant
{
    public Guid OrganizationId { get; private set; }
    public Guid ExportedById { get; private set; }
    public string Module { get; private set; } = string.Empty;
    public string EntityType { get; private set; } = string.Empty;
    public ExportFormat ExportFormat { get; private set; }
    public string? FilterCriteria { get; private set; }
    public string? FileName { get; private set; }
    public long? FileSize { get; private set; }
    public string? FileStoragePath { get; private set; }
    public ExportJobStatus Status { get; private set; }
    public int? TotalRecords { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private ExportJob() { }

    public static ExportJob Create(
        Guid organizationId,
        Guid exportedById,
        string module,
        string entityType,
        ExportFormat exportFormat,
        string? filterCriteria)
    {
        var job = new ExportJob
        {
            OrganizationId = organizationId,
            ExportedById = exportedById,
            Module = module,
            EntityType = entityType,
            ExportFormat = exportFormat,
            FilterCriteria = filterCriteria,
            Status = ExportJobStatus.Pending
        };

        job.AddDomainEvent(new ExportJobCreatedEvent(job.Id, organizationId, module, exportFormat.ToString()));
        return job;
    }

    public void Start()
    {
        Status = ExportJobStatus.Processing;
        StartedAt = DateTime.UtcNow;
    }

    public void Complete(string fileName, long fileSize, string storagePath, int totalRecords)
    {
        FileName = fileName;
        FileSize = fileSize;
        FileStoragePath = storagePath;
        TotalRecords = totalRecords;
        Status = ExportJobStatus.Completed;
        CompletedAt = DateTime.UtcNow;
    }

    public void Fail()
    {
        Status = ExportJobStatus.Failed;
        CompletedAt = DateTime.UtcNow;
    }
}
