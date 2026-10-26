using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Entities;

/// <summary>
/// Hierarchical categorization for project interventions.
/// Self-referencing tree structure (ParentId → Id).
/// Organization-scoped — each org manages its own intervention area taxonomy.
/// </summary>
public class InterventionArea : AuditableEntity, ISoftDeletable
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public int Level { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Self-referencing hierarchy
    public Guid? ParentId { get; set; }
    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public InterventionArea? Parent { get; set; }
    public ICollection<InterventionArea> Children { get; private set; } = [];
    public ICollection<ProjectInterventionArea> ProjectAllocations { get; private set; } = [];

    public static InterventionArea Create(string name, string code, Guid orgId, Guid? parentId = null, int level = 0)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(code)) throw new ArgumentException("Code is required.", nameof(code));
        return new InterventionArea
        {
            Name = name.Trim(),
            Code = code.Trim(),
            OrganizationId = orgId,
            ParentId = parentId,
            Level = level
        };
    }

    public void Update(string name, string? description, int sortOrder)
    {
        Name = name.Trim();
        Description = description;
        SortOrder = sortOrder;
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;
}
