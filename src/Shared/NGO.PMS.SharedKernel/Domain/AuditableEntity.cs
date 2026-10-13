namespace NGO.PMS.SharedKernel.Domain;

/// <summary>
/// Entity with automatic audit timestamps and user tracking.
/// </summary>
public abstract class AuditableEntity : BaseEntity
{
    public DateTimeOffset CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
