using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Training.Domain.Enums;

namespace NGO.PMS.Training.Domain.Entities;

/// <summary>
/// Training program with curriculum settings per REQ-TRN-001/002.
/// </summary>
public class TrainingProgram : AuditableEntity, ISoftDeletable
{
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public TrainingCategory Category { get; private set; }
    public Guid ProjectId { get; private set; }
    public int TotalSessions { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public ICollection<TrainingSession> Sessions { get; private set; } = [];

    public static TrainingProgram Create(
        string title, TrainingCategory category, Guid projectId,
        int totalSessions, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));

        return new TrainingProgram
        {
            Title = title.Trim(),
            Description = description?.Trim(),
            Category = category,
            ProjectId = projectId,
            TotalSessions = totalSessions
        };
    }

    public void Update(string title, TrainingCategory category,
        int totalSessions, string? description)
    {
        Title = title.Trim();
        Category = category;
        TotalSessions = totalSessions;
        Description = description?.Trim();
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public void Activate()
    {
        IsActive = true;
    }
}
