using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Identity.Domain.Entities;

/// <summary>
/// ABAC rule: refines a permission with attribute conditions.
/// Example: permission "projects.reports.read" WHERE office_id = "abc-123"
/// </summary>
public class AttributeRule : BaseEntity, IMultiTenant
{
    public Guid PermissionId { get; set; }
    public string AttributeName { get; set; } = string.Empty;
    public string Operator { get; set; } = "eq";
    public string AttributeValue { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }

    // Navigation
    public Permission Permission { get; set; } = null!;
}
