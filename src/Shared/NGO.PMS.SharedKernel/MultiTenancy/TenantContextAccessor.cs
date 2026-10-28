namespace NGO.PMS.SharedKernel.MultiTenancy;

/// <summary>
/// Scoped service that holds the resolved tenant for the current request.
/// Registered as Scoped so each request gets its own instance.
/// </summary>
public sealed class TenantContextAccessor : ITenantContextAccessor
{
    public EthelTenantInfo? CurrentTenant { get; set; }
}
