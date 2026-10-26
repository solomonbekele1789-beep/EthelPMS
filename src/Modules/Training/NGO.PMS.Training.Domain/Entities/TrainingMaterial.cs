using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Training.Domain.Entities;

/// <summary>
/// Training material attached to a program (handout, presentation, video, manual).
/// </summary>
public class TrainingMaterial : AuditableEntity
{
    public Guid TrainingProgramId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? FileUrl { get; private set; }
    public string MaterialType { get; private set; } = string.Empty;

    public static TrainingMaterial Create(
        Guid trainingProgramId, string title, string materialType,
        string? description = null, string? fileUrl = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));

        return new TrainingMaterial
        {
            TrainingProgramId = trainingProgramId,
            Title = title.Trim(),
            MaterialType = materialType.Trim(),
            Description = description?.Trim(),
            FileUrl = fileUrl?.Trim()
        };
    }

    public void Update(string title, string materialType,
        string? description, string? fileUrl)
    {
        Title = title.Trim();
        MaterialType = materialType.Trim();
        Description = description?.Trim();
        FileUrl = fileUrl?.Trim();
    }
}
