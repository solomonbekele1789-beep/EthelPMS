using NGO.PMS.ImportExport.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.ImportExport.Domain.Entities;

public class DataSyncConfig : AuditableEntity, IMultiTenant
{
    public Guid OrganizationId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public DataSourceType SourceType { get; private set; }
    public string SourceUrl { get; private set; } = string.Empty;
    public string? ApiKey { get; private set; }
    public string? FormId { get; private set; }
    public string TargetModule { get; private set; } = string.Empty;
    public string TargetEntityType { get; private set; } = string.Empty;
    public string MappingConfig { get; private set; } = string.Empty;
    public string? SyncFrequency { get; private set; }
    public DateTime? LastSyncAt { get; private set; }
    public bool IsActive { get; private set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private DataSyncConfig() { }

    public static DataSyncConfig Create(
        Guid organizationId,
        string name,
        DataSourceType sourceType,
        string sourceUrl,
        string? apiKey,
        string? formId,
        string targetModule,
        string targetEntityType,
        string mappingConfig,
        string? syncFrequency)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Sync config name is required.", nameof(name));

        return new DataSyncConfig
        {
            OrganizationId = organizationId,
            Name = name,
            SourceType = sourceType,
            SourceUrl = sourceUrl,
            ApiKey = apiKey,
            FormId = formId,
            TargetModule = targetModule,
            TargetEntityType = targetEntityType,
            MappingConfig = mappingConfig,
            SyncFrequency = syncFrequency,
            IsActive = true
        };
    }

    public void Update(string name, string sourceUrl, string? apiKey, string mappingConfig, string? syncFrequency, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Sync config name is required.", nameof(name));

        Name = name;
        SourceUrl = sourceUrl;
        ApiKey = apiKey;
        MappingConfig = mappingConfig;
        SyncFrequency = syncFrequency;
        IsActive = isActive;
    }

    public void RecordSync()
    {
        LastSyncAt = DateTime.UtcNow;
    }
}
