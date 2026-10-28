using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Domain.Entities;

/// <summary>
/// Graduation criteria/benchmark framework per REQ-GRAD-001.
/// Defines indicator domains with configurable thresholds for pillar stage computation.
/// Thresholds per REQ-GRAD-002: >=80% = P4, >=50% = P3, >=25% = P2, below = P1.
/// </summary>
public class GraduationBenchmark : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Domain { get; private set; } = string.Empty;

    /// <summary>
    /// Minimum score percentage to reach P2 (default 25).
    /// </summary>
    public decimal ThresholdP2 { get; private set; } = 25m;

    /// <summary>
    /// Minimum score percentage to reach P3 (default 50).
    /// </summary>
    public decimal ThresholdP3 { get; private set; } = 50m;

    /// <summary>
    /// Minimum score percentage to reach P4 (default 80).
    /// </summary>
    public decimal ThresholdP4 { get; private set; } = 80m;

    /// <summary>
    /// If true, this benchmark must be met at P4 for graduation eligibility.
    /// </summary>
    public bool RequiredForGraduation { get; private set; }

    public decimal Weight { get; private set; } = 1m;
    public bool IsActive { get; private set; } = true;

    /// <summary>
    /// Optional project-specific benchmark. Null = global (all projects).
    /// </summary>
    public Guid? ProjectId { get; private set; }

    public Guid OrganizationId { get; set; }

    // Navigation
    public ICollection<GraduationAssessment> Assessments { get; private set; } = [];

    public static GraduationBenchmark Create(
        string name, string domain, Guid orgId,
        bool requiredForGraduation = false, Guid? projectId = null,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Benchmark name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(domain))
            throw new ArgumentException("Domain is required.", nameof(domain));

        return new GraduationBenchmark
        {
            Name = name.Trim(),
            Domain = domain.Trim(),
            Description = description,
            RequiredForGraduation = requiredForGraduation,
            ProjectId = projectId,
            OrganizationId = orgId
        };
    }

    public void Update(string name, string domain, string? description,
        decimal thresholdP2, decimal thresholdP3, decimal thresholdP4,
        bool requiredForGraduation, decimal weight)
    {
        if (thresholdP2 >= thresholdP3 || thresholdP3 >= thresholdP4)
            throw new ArgumentException("Thresholds must be P2 < P3 < P4.");
        if (thresholdP2 < 0 || thresholdP4 > 100)
            throw new ArgumentException("Thresholds must be between 0 and 100.");

        Name = name.Trim();
        Domain = domain.Trim();
        Description = description;
        ThresholdP2 = thresholdP2;
        ThresholdP3 = thresholdP3;
        ThresholdP4 = thresholdP4;
        RequiredForGraduation = requiredForGraduation;
        Weight = weight;
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;
}
