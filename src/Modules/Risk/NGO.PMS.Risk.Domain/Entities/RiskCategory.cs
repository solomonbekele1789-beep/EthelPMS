using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Risk.Domain.Entities;

public class RiskCategory : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? Color { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; }
    public Guid OrganizationId { get; set; }

    private RiskCategory() { }

    public static RiskCategory Create(
        string name,
        Guid organizationId,
        string? description = null,
        string? color = null,
        int sortOrder = 0)
    {
        var category = new RiskCategory
        {
            Name = name,
            OrganizationId = organizationId,
            Description = description,
            Color = color,
            SortOrder = sortOrder,
            IsActive = true
        };

        return category;
    }

    public void Update(string name, string? description, string? color, int sortOrder)
    {
        Name = name;
        Description = description;
        Color = color;
        SortOrder = sortOrder;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}
