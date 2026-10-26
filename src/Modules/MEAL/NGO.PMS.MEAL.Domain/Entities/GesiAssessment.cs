using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Domain.Entities;

/// <summary>
/// Gender &amp; Social Inclusion assessment per REQ-GESI-001/002.
/// IASC Gender with Age Marker scoring (0-4).
/// </summary>
public class GesiAssessment : AuditableEntity
{
    public Guid ProjectId { get; private set; }
    public string? GesiAnalysis { get; private set; }

    /// <summary>
    /// IASC Gender with Age Marker score (0-4) per REQ-GESI-002.
    /// 0 = Not gender-responsive, 4 = Fully gender-responsive.
    /// </summary>
    public int GenderMarkerScore { get; private set; }
    public string? GenderMarkerJustification { get; private set; }

    public string? KeyFindings { get; private set; }
    public string? Recommendations { get; private set; }
    public DateTimeOffset AssessmentDate { get; private set; }

    public Guid OrganizationId { get; set; }

    public static GesiAssessment Create(
        Guid projectId, int genderMarkerScore, DateTimeOffset assessmentDate,
        Guid orgId, string? analysis = null, string? justification = null)
    {
        if (genderMarkerScore < 0 || genderMarkerScore > 4)
            throw new ArgumentException("Gender marker score must be between 0 and 4.", nameof(genderMarkerScore));

        return new GesiAssessment
        {
            ProjectId = projectId,
            GenderMarkerScore = genderMarkerScore,
            GenderMarkerJustification = justification,
            GesiAnalysis = analysis,
            AssessmentDate = assessmentDate,
            OrganizationId = orgId
        };
    }

    public void Update(string? analysis, int genderMarkerScore, string? justification,
        string? keyFindings, string? recommendations)
    {
        if (genderMarkerScore < 0 || genderMarkerScore > 4)
            throw new ArgumentException("Gender marker score must be between 0 and 4.", nameof(genderMarkerScore));

        GesiAnalysis = analysis;
        GenderMarkerScore = genderMarkerScore;
        GenderMarkerJustification = justification;
        KeyFindings = keyFindings;
        Recommendations = recommendations;
    }
}
