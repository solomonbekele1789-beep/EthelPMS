using NGO.PMS.Risk.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Risk.Domain.Entities;

public class RiskAssessment : AuditableEntity
{
    public Guid RiskId { get; private set; }
    public Likelihood Likelihood { get; private set; }
    public Impact Impact { get; private set; }
    public int RiskScore { get; private set; }
    public string? Notes { get; private set; }
    public string AssessedBy { get; private set; } = string.Empty;
    public DateTime AssessmentDate { get; private set; }
    public string? Source { get; private set; }

    // Navigation
    public Risk? Risk { get; private set; }

    private RiskAssessment() { }

    public static RiskAssessment Create(
        Guid riskId,
        Likelihood likelihood,
        Impact impact,
        string assessedBy,
        string? notes = null,
        string? source = null)
    {
        var assessment = new RiskAssessment
        {
            RiskId = riskId,
            Likelihood = likelihood,
            Impact = impact,
            RiskScore = (int)likelihood * (int)impact,
            AssessedBy = assessedBy,
            AssessmentDate = DateTime.UtcNow,
            Notes = notes,
            Source = source
        };

        return assessment;
    }
}
