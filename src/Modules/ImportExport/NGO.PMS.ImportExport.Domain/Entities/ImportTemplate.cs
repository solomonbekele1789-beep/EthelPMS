using NGO.PMS.ImportExport.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.ImportExport.Domain.Entities;

public class ImportTemplate : AuditableEntity, ISoftDeletable, IMultiTenant
{
    public Guid OrganizationId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Module { get; private set; } = string.Empty;
    public string EntityType { get; private set; } = string.Empty;
    public ImportFileFormat FileFormat { get; private set; }
    public string ColumnMappings { get; private set; } = string.Empty;
    public string? ValidationRules { get; private set; }
    public string? SampleFileUrl { get; private set; }
    public bool IsSystemTemplate { get; private set; }
    public bool IsActive { get; private set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private ImportTemplate() { }

    public static ImportTemplate Create(
        Guid organizationId,
        string name,
        string module,
        string entityType,
        ImportFileFormat fileFormat,
        string columnMappings,
        string? validationRules,
        bool isSystemTemplate)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Template name is required.", nameof(name));

        return new ImportTemplate
        {
            OrganizationId = organizationId,
            Name = name,
            Module = module,
            EntityType = entityType,
            FileFormat = fileFormat,
            ColumnMappings = columnMappings,
            ValidationRules = validationRules,
            IsSystemTemplate = isSystemTemplate,
            IsActive = true
        };
    }

    public void Update(string name, string columnMappings, string? validationRules, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Template name is required.", nameof(name));

        Name = name;
        ColumnMappings = columnMappings;
        ValidationRules = validationRules;
        IsActive = isActive;
    }
}
