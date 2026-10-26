using NGO.PMS.Risk.Domain.Enums;
using NGO.PMS.Risk.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Risk.Domain.Entities;

public class RiskMitigation : AuditableEntity
{
    public Guid RiskId { get; private set; }
    public string Action { get; private set; } = string.Empty;
    public string? ResponsiblePerson { get; private set; }
    public Guid? ResponsibleUserId { get; private set; }
    public DateTime PlannedDate { get; private set; }
    public DateTime? CompletedDate { get; private set; }
    public MitigationStatus Status { get; private set; }
    public decimal? EstimatedCost { get; private set; }
    public string? Notes { get; private set; }

    // Navigation
    public Risk? Risk { get; private set; }

    private RiskMitigation() { }

    public static RiskMitigation Create(
        Guid riskId,
        string action,
        DateTime plannedDate,
        string? responsiblePerson = null,
        Guid? responsibleUserId = null,
        decimal? estimatedCost = null,
        string? notes = null)
    {
        var mitigation = new RiskMitigation
        {
            RiskId = riskId,
            Action = action,
            PlannedDate = plannedDate,
            ResponsiblePerson = responsiblePerson,
            ResponsibleUserId = responsibleUserId,
            EstimatedCost = estimatedCost,
            Notes = notes,
            Status = MitigationStatus.Planned
        };

        return mitigation;
    }

    public void Start()
    {
        Status = MitigationStatus.InProgress;
    }

    public void Complete()
    {
        Status = MitigationStatus.Completed;
        CompletedDate = DateTime.UtcNow;

        AddDomainEvent(new MitigationCompletedEvent(Id, RiskId));
    }

    public void MarkOverdue()
    {
        Status = MitigationStatus.Overdue;
    }
}
