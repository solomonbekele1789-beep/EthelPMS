namespace NGO.PMS.SharedKernel.MultiTenancy;

/// <summary>
/// Tenant info representing one NGO organization.
/// Contains tenant identification and subscription/access metadata.
/// </summary>
public class EthelTenantInfo
{
    /// <summary>
    /// Tenant ID (organization_id as string).
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// URL-safe slug: e.g., 'mercy-corps-et'.
    /// </summary>
    public string Identifier { get; set; } = string.Empty;

    /// <summary>
    /// Display name of the organization.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Per-tenant connection string. NULL = shared database (current strategy).
    /// </summary>
    public string? ConnectionString { get; set; }

    // ── Custom Properties ────────────────────────────────

    public bool IsActive { get; set; }
    public string SubscriptionTier { get; set; } = "free";
    public int MaxUsers { get; set; }
    public int MaxProjects { get; set; }
    public int MaxStorageMb { get; set; }
    public List<string> EnabledModules { get; set; } = [];
}
