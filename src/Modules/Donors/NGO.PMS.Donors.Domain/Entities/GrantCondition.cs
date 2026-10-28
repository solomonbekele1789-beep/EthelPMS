using NGO.PMS.Donors.Domain.Enums;
using NGO.PMS.Donors.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Donors.Domain.Entities;

public class GrantCondition : AuditableEntity, IMultiTenant
{
    public Guid GrantId { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public DateTime DueDate { get; private set; }
    public ConditionStatus Status { get; private set; } = ConditionStatus.Pending;
    public string? CompletionNotes { get; private set; }
    public DateTime? CompletedDate { get; private set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private GrantCondition() { }

    public static GrantCondition Create(Guid grantId, string description, DateTime dueDate)
    {
        if (grantId == Guid.Empty)
            throw new ArgumentException("Grant ID is required.", nameof(grantId));
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Condition description is required.", nameof(description));

        return new GrantCondition
        {
            GrantId = grantId,
            Description = description,
            DueDate = dueDate,
            Status = ConditionStatus.Pending
        };
    }

    public void MarkMet(string? notes)
    {
        Status = ConditionStatus.Met;
        CompletionNotes = notes;
        CompletedDate = DateTime.UtcNow;
    }

    public void MarkOverdue()
    {
        Status = ConditionStatus.Overdue;
        AddDomainEvent(new GrantConditionOverdueEvent(Id, GrantId, DueDate));
    }

    public void Waive(string reason)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Waiver reason is required.", nameof(reason));

        Status = ConditionStatus.Waived;
        CompletionNotes = reason;
    }
}
