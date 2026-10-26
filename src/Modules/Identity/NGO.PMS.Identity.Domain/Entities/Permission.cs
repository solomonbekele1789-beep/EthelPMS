using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Identity.Domain.Entities;

/// <summary>
/// Global permission definition. NOT tenant-scoped.
/// Format: {module}.{resource}.{action}
/// </summary>
public class Permission : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string Resource { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;

    // Navigation
    public ICollection<RolePermission> RolePermissions { get; set; } = [];
}
