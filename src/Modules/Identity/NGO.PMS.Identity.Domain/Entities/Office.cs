using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Identity.Domain.Entities;

public class Office : AuditableEntity, ISoftDeletable
{
    public string Name { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty;
    public Guid? ParentOfficeId { get; private set; }
    public Guid? LocationId { get; private set; }
    public Guid OrganizationId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public Office? ParentOffice { get; private set; }
    public ICollection<Office> ChildOffices { get; private set; } = [];
    public Location? Location { get; private set; }

    public static Office Create(string name, string code, Guid orgId, Guid? parentOfficeId = null, Guid? locationId = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(code)) throw new ArgumentException("Code is required.", nameof(code));
        return new Office
        {
            Name = name.Trim(),
            Code = code.Trim(),
            OrganizationId = orgId,
            ParentOfficeId = parentOfficeId,
            LocationId = locationId
        };
    }

    public void Update(string name, string code, Guid? parentOfficeId, Guid? locationId)
    {
        Name = name.Trim();
        Code = code.Trim();
        ParentOfficeId = parentOfficeId;
        LocationId = locationId;
    }
}
