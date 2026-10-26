using NGO.PMS.Partnerships.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Partnerships.Domain.Entities;

public class PartnerCompliance : AuditableEntity, IMultiTenant
{
    public Guid OrganizationId { get; private set; }
    public Guid SubGranteeId { get; private set; }
    public ComplianceType ComplianceType { get; private set; }
    public DateTime CheckDate { get; private set; }
    public Guid AssessorId { get; private set; }
    public int Score { get; private set; }
    public string Findings { get; private set; } = string.Empty;
    public string? Recommendations { get; private set; }
    public ComplianceStatus Status { get; private set; }
    public DateTime? FollowUpDate { get; private set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private PartnerCompliance() { }

    public static PartnerCompliance Create(
        Guid organizationId,
        Guid subGranteeId,
        ComplianceType complianceType,
        DateTime checkDate,
        Guid assessorId)
    {
        if (subGranteeId == Guid.Empty)
            throw new ArgumentException("Sub-grantee ID is required.", nameof(subGranteeId));
        if (assessorId == Guid.Empty)
            throw new ArgumentException("Assessor ID is required.", nameof(assessorId));

        return new PartnerCompliance
        {
            OrganizationId = organizationId,
            SubGranteeId = subGranteeId,
            ComplianceType = complianceType,
            CheckDate = checkDate,
            AssessorId = assessorId,
            Status = ComplianceStatus.Scheduled
        };
    }

    public void Complete(int score, string findings)
    {
        if (score < 0 || score > 100)
            throw new ArgumentException("Score must be between 0 and 100.", nameof(score));
        if (string.IsNullOrWhiteSpace(findings))
            throw new ArgumentException("Findings are required.", nameof(findings));

        Score = score;
        Findings = findings;
        Status = ComplianceStatus.Completed;
    }

    public void RequireFollowUp(DateTime followUpDate, string recommendations)
    {
        if (string.IsNullOrWhiteSpace(recommendations))
            throw new ArgumentException("Recommendations are required.", nameof(recommendations));

        FollowUpDate = followUpDate;
        Recommendations = recommendations;
        Status = ComplianceStatus.FollowUpRequired;
    }
}
