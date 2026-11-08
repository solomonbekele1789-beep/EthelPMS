using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Identity.Domain.Entities;

public class Office : AuditableEntity, ISoftDeletable
{
    public string Name { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty;
    public string OfficeType { get; private set; } = "HeadOffice"; // HeadOffice, AreaOffice, BranchOffice
    public string? Description { get; private set; }
    public string? LocationAddress { get; private set; }
    public double? Latitude { get; private set; }
    public double? Longitude { get; private set; }
    public bool IsActive { get; private set; } = true;
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

    public static Office Create(
        string name,
        string code,
        Guid orgId,
        string officeType = "HeadOffice",
        string? description = null,
        string? locationAddress = null,
        double? latitude = null,
        double? longitude = null,
        bool isActive = true,
        Guid? parentOfficeId = null,
        Guid? locationId = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(code)) throw new ArgumentException("Code is required.", nameof(code));

        return new Office
        {
            Name = name.Trim(),
            Code = code.Trim(),
            OrganizationId = orgId,
            OfficeType = string.IsNullOrWhiteSpace(officeType) ? "HeadOffice" : officeType.Trim(),
            Description = description?.Trim(),
            LocationAddress = locationAddress?.Trim(),
            Latitude = latitude,
            Longitude = longitude,
            IsActive = isActive,
            ParentOfficeId = parentOfficeId,
            LocationId = locationId
        };
    }

    public void Update(
        string name,
        string code,
        string officeType,
        string? description,
        string? locationAddress,
        double? latitude,
        double? longitude,
        bool isActive,
        Guid? parentOfficeId,
        Guid? locationId)
    {
        Name = name.Trim();
        Code = code.Trim();
        OfficeType = string.IsNullOrWhiteSpace(officeType) ? "HeadOffice" : officeType.Trim();
        Description = description?.Trim();
        LocationAddress = locationAddress?.Trim();
        Latitude = latitude;
        Longitude = longitude;
        IsActive = isActive;
        ParentOfficeId = parentOfficeId;
        LocationId = locationId;
    }
}
