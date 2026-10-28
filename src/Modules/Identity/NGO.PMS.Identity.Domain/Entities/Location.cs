using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Identity.Domain.Enums;

namespace NGO.PMS.Identity.Domain.Entities;

/// <summary>
/// Ethiopian administrative geography: Region -> Zone -> Woreda -> Kebele.
/// Read-only reference data seeded via DbUp.
/// </summary>
public class Location : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? NameAm { get; set; }
    public LocationLevel Level { get; set; }
    public Guid? ParentId { get; set; }
    public string? Code { get; set; }

    // Navigation
    public Location? Parent { get; set; }
    public ICollection<Location> Children { get; set; } = [];
}
