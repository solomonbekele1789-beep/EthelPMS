using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Dashboards.Domain.Entities;

public class SavedFilter : BaseEntity, IMultiTenant
{
    public Guid OrganizationId { get; set; }
    public Guid UserId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Module { get; private set; } = string.Empty;
    public string? FilterJson { get; private set; }
    public bool IsDefault { get; private set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private SavedFilter() { }

    public static SavedFilter Create(
        Guid organizationId,
        Guid userId,
        string name,
        string module,
        string? filterJson,
        bool isDefault)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(module);

        return new SavedFilter
        {
            OrganizationId = organizationId,
            UserId = userId,
            Name = name,
            Module = module,
            FilterJson = filterJson,
            IsDefault = isDefault
        };
    }
}
