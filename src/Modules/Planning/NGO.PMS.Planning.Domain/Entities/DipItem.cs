using NGO.PMS.Planning.Domain.Enums;
using NGO.PMS.Planning.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Planning.Domain.Entities;

/// <summary>
/// Detailed Implementation Plan item — a sub-activity under a project activity.
/// DIP budget cannot exceed parent activity budget.
/// DIP dates must fall within parent activity dates.
/// </summary>
public class DipItem : AuditableEntity, ISoftDeletable
{
    public Guid ActivityId { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public DateTimeOffset PlannedStartDate { get; private set; }
    public DateTimeOffset PlannedEndDate { get; private set; }
    public DateTimeOffset? ActualStartDate { get; private set; }
    public DateTimeOffset? ActualEndDate { get; private set; }
    public decimal BudgetAllocated { get; private set; }
    public Guid? ResponsibleUserId { get; set; }
    public DipStatus Status { get; private set; } = DipStatus.NotStarted;
    public int SortOrder { get; private set; }
    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public ICollection<DipMilestone> Milestones { get; private set; } = [];

    public static DipItem Create(
        Guid activityId, Guid projectId, string title,
        DateTimeOffset plannedStart, DateTimeOffset plannedEnd,
        decimal budget, Guid orgId, int sortOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("DIP title is required.", nameof(title));
        if (plannedEnd <= plannedStart)
            throw new ArgumentException("End date must be after start date.", nameof(plannedEnd));
        if (budget < 0)
            throw new ArgumentException("Budget cannot be negative.", nameof(budget));

        var dip = new DipItem
        {
            ActivityId = activityId,
            ProjectId = projectId,
            Title = title.Trim(),
            PlannedStartDate = plannedStart,
            PlannedEndDate = plannedEnd,
            BudgetAllocated = budget,
            OrganizationId = orgId,
            SortOrder = sortOrder
        };
        dip.AddDomainEvent(new DipItemCreatedEvent(dip.Id, activityId, projectId));
        return dip;
    }

    public void Update(string title, string? description,
        DateTimeOffset plannedStart, DateTimeOffset plannedEnd, decimal budget, int sortOrder)
    {
        Title = title.Trim();
        Description = description;
        PlannedStartDate = plannedStart;
        PlannedEndDate = plannedEnd;
        BudgetAllocated = budget;
        SortOrder = sortOrder;
    }

    public void UpdateStatus(DipStatus status) => Status = status;

    public void SetActualDates(DateTimeOffset? actualStart, DateTimeOffset? actualEnd)
    {
        ActualStartDate = actualStart;
        ActualEndDate = actualEnd;
    }

    public void AssignUser(Guid userId) => ResponsibleUserId = userId;
    public void UnassignUser() => ResponsibleUserId = null;
}
