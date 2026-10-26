using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Entities;

/// <summary>
/// Unit of measurement for indicators (e.g., "Number", "Percentage", "Km").
/// Organization-scoped to allow custom units.
/// </summary>
public class UnitOfMeasurement : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Abbreviation { get; private set; }
    public Guid OrganizationId { get; set; }

    public static UnitOfMeasurement Create(string name, string? abbreviation, Guid orgId)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));
        return new UnitOfMeasurement
        {
            Name = name.Trim(),
            Abbreviation = abbreviation?.Trim(),
            OrganizationId = orgId
        };
    }

    public void Update(string name, string? abbreviation)
    {
        Name = name.Trim();
        Abbreviation = abbreviation?.Trim();
    }
}
