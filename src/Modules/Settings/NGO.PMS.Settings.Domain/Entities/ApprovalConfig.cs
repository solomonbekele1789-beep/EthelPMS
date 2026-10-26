using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Settings.Domain.Entities;

public class ApprovalConfig : AuditableEntity, ISoftDeletable, IMultiTenant
{
    public Guid OrganizationId { get; set; }
    public string Module { get; private set; } = string.Empty;
    public string EntityType { get; private set; } = string.Empty;
    public int RequiredApprovalLevels { get; private set; }
    public decimal? AutoApproveBelow { get; private set; }
    public bool IsActive { get; private set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private ApprovalConfig() { }

    public static ApprovalConfig Create(
        Guid organizationId,
        string module,
        string entityType,
        int requiredApprovalLevels,
        decimal? autoApproveBelow,
        bool isActive)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(module);
        ArgumentException.ThrowIfNullOrWhiteSpace(entityType);

        if (requiredApprovalLevels < 1 || requiredApprovalLevels > 5)
            throw new ArgumentOutOfRangeException(nameof(requiredApprovalLevels), "Must be between 1 and 5.");

        return new ApprovalConfig
        {
            OrganizationId = organizationId,
            Module = module,
            EntityType = entityType,
            RequiredApprovalLevels = requiredApprovalLevels,
            AutoApproveBelow = autoApproveBelow,
            IsActive = isActive
        };
    }

    public void Update(int requiredApprovalLevels, decimal? autoApproveBelow, bool isActive)
    {
        if (requiredApprovalLevels < 1 || requiredApprovalLevels > 5)
            throw new ArgumentOutOfRangeException(nameof(requiredApprovalLevels), "Must be between 1 and 5.");

        RequiredApprovalLevels = requiredApprovalLevels;
        AutoApproveBelow = autoApproveBelow;
        IsActive = isActive;
    }
}
