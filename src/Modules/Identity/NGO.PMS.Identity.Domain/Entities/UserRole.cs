using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Identity.Domain.Entities;

/// <summary>Junction table: User ↔ Role, with assignment metadata</summary>
public class UserRole : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public DateTimeOffset AssignedAt { get; set; } = DateTimeOffset.UtcNow;
    public Guid? AssignedBy { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public Role Role { get; set; } = null!;
}
