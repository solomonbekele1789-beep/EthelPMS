namespace NGO.PMS.SharedKernel.Domain;

/// <summary>
/// Marks an entity as belonging to a specific tenant/organization.
/// </summary>
public interface IMultiTenant
{
    Guid TenantId { get; set; }
}
