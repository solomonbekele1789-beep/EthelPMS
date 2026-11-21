using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Identity.Domain.Entities;

public class Role : AuditableEntity, ISoftDeletable, IMultiTenant
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public bool IsSystemRole { get; private set; }
    public Guid OrganizationId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public ICollection<RolePermission> RolePermissions { get; private set; } = [];
    public ICollection<UserRole> UserRoles { get; private set; } = [];

    public static Role Create(string name, string? description, Guid orgId, bool isSystemRole = false)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Role name is required.", nameof(name));
        return new Role
        {
            Name = name.Trim(),
            Description = description,
            OrganizationId = orgId,
            IsSystemRole = isSystemRole
        };
    }

    public void Update(string name, string? description)
    {
        Name = name.Trim();
        Description = description;
    }
}
