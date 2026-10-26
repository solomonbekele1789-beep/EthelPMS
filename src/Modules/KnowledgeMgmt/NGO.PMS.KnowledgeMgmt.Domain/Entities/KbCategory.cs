using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.KnowledgeMgmt.Domain.Entities;

public class KbCategory : AuditableEntity, ISoftDeletable, IMultiTenant
{
    public Guid OrganizationId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid? ParentCategoryId { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    // Navigation
    public KbCategory? ParentCategory { get; private set; }

    private readonly List<KbCategory> _childCategories = [];
    public IReadOnlyList<KbCategory> ChildCategories => _childCategories.AsReadOnly();

    private KbCategory() { }

    public static KbCategory Create(Guid organizationId, string name, string? description,
        Guid? parentCategoryId, int sortOrder)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name is required.", nameof(name));

        return new KbCategory
        {
            OrganizationId = organizationId,
            Name = name,
            Description = description,
            ParentCategoryId = parentCategoryId,
            SortOrder = sortOrder,
            IsActive = true
        };
    }

    public void Update(string name, string? description, int sortOrder, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name is required.", nameof(name));

        Name = name;
        Description = description;
        SortOrder = sortOrder;
        IsActive = isActive;
    }
}
