using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Entities;

/// <summary>
/// Hierarchical categorization for project interventions.
/// Administrative levels: Country (0) → Region (1) → Zone (2) → Woreda (3) → Kebele (4) → Site (5)
/// Supports GPS coordinates (via device sensor or manual entry) and physical landmark details.
/// </summary>
public class InterventionArea : AuditableEntity, ISoftDeletable
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string AreaType { get; private set; } = "Region";
    public int Level { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    // GPS & Geographic Location
    public double? Latitude { get; private set; }
    public double? Longitude { get; private set; }
    public double? Altitude { get; private set; }
    public double? Accuracy { get; private set; }
    public string? GpsSource { get; private set; } // "Device" | "Manual"
    public string? LandmarkOrAddress { get; private set; }

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

    public static InterventionArea Create(
        string name,
        string code,
        Guid orgId,
        string areaType = "Region",
        Guid? parentId = null,
        int level = 0,
        double? latitude = null,
        double? longitude = null,
        double? altitude = null,
        double? accuracy = null,
        string? gpsSource = null,
        string? landmarkOrAddress = null,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(code)) throw new ArgumentException("Code is required.", nameof(code));

        return new InterventionArea
        {
            Name = name.Trim(),
            Code = code.Trim().ToUpperInvariant(),
            OrganizationId = orgId,
            AreaType = string.IsNullOrWhiteSpace(areaType) ? "Region" : areaType.Trim(),
            ParentId = parentId,
            Level = level,
            Latitude = latitude,
            Longitude = longitude,
            Altitude = altitude,
            Accuracy = accuracy,
            GpsSource = gpsSource,
            LandmarkOrAddress = landmarkOrAddress,
            Description = description
        };
    }

    public void Update(
        string name,
        string? description,
        int sortOrder,
        string? areaType = null,
        double? latitude = null,
        double? longitude = null,
        double? altitude = null,
        double? accuracy = null,
        string? gpsSource = null,
        string? landmarkOrAddress = null,
        bool? isActive = null)
    {
        Name = name.Trim();
        Description = description;
        SortOrder = sortOrder;
        if (!string.IsNullOrWhiteSpace(areaType)) AreaType = areaType.Trim();
        Latitude = latitude;
        Longitude = longitude;
        Altitude = altitude;
        Accuracy = accuracy;
        GpsSource = gpsSource;
        LandmarkOrAddress = landmarkOrAddress;
        if (isActive.HasValue) IsActive = isActive.Value;
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;
}
