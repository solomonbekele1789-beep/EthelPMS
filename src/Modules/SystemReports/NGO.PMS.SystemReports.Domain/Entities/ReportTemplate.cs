using NGO.PMS.SystemReports.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.SystemReports.Domain.Entities;

public class ReportTemplate : AuditableEntity, ISoftDeletable
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Module { get; private set; } = string.Empty;
    public ReportFormat ReportFormat { get; private set; }
    public string QueryDefinition { get; private set; } = string.Empty;
    public string? TemplateContent { get; private set; }
    public bool IsSystemTemplate { get; private set; }
    public bool IsActive { get; private set; } = true;

    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    public static ReportTemplate Create(
        string name, string module, ReportFormat format, string queryDefinition,
        Guid orgId, string? description = null, string? templateContent = null,
        bool isSystemTemplate = false)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Report template name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(module))
            throw new ArgumentException("Module is required.", nameof(module));
        if (string.IsNullOrWhiteSpace(queryDefinition))
            throw new ArgumentException("Query definition is required.", nameof(queryDefinition));

        return new ReportTemplate
        {
            Name = name.Trim(),
            Description = description,
            Module = module.Trim(),
            ReportFormat = format,
            QueryDefinition = queryDefinition,
            TemplateContent = templateContent,
            IsSystemTemplate = isSystemTemplate,
            OrganizationId = orgId
        };
    }

    public void Update(string name, string? description, string queryDefinition,
        string? templateContent, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Report template name is required.", nameof(name));
        Name = name.Trim();
        Description = description;
        QueryDefinition = queryDefinition;
        TemplateContent = templateContent;
        IsActive = isActive;
    }

    public void Deactivate() => IsActive = false;
}
