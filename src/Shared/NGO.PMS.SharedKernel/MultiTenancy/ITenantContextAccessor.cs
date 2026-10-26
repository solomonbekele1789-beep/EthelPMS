namespace NGO.PMS.SharedKernel.MultiTenancy;

/// <summary>
/// Provides access to the current tenant context for the request.
/// Replaces Finbuckle's IMultiTenantContextAccessor with a simpler, custom implementation.
/// </summary>
public interface ITenantContextAccessor
{
    /// <summary>
    /// The resolved tenant for the current request. Null if no tenant resolved.
    /// </summary>
    EthelTenantInfo? CurrentTenant { get; set; }
}
