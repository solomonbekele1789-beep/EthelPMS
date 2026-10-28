using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Planning.Domain.Entities;

/// <summary>
/// Milestone tracking under a DIP item.
/// </summary>
public class DipMilestone : BaseEntity
{
    public Guid DipItemId { get; set; }
    public string Title { get; private set; } = string.Empty;
    public DateTimeOffset DueDate { get; private set; }
    public DateTimeOffset? CompletedDate { get; private set; }
    public bool IsCompleted { get; private set; }
    public Guid OrganizationId { get; set; }

    // Navigation
    public DipItem DipItem { get; set; } = null!;

    public static DipMilestone Create(Guid dipItemId, string title, DateTimeOffset dueDate, Guid orgId)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Milestone title is required.", nameof(title));
        return new DipMilestone
        {
            DipItemId = dipItemId,
            Title = title.Trim(),
            DueDate = dueDate,
            OrganizationId = orgId
        };
    }

    public void Complete()
    {
        IsCompleted = true;
        CompletedDate = DateTimeOffset.UtcNow;
    }

    public void Reopen()
    {
        IsCompleted = false;
        CompletedDate = null;
    }

    public void Update(string title, DateTimeOffset dueDate)
    {
        Title = title.Trim();
        DueDate = dueDate;
    }
}
