using NGO.PMS.MEAL.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Domain.Entities;

/// <summary>
/// Evaluation finding with management response workflow per REQ-MEAL-014/015/016.
/// Separation of duties: verifier cannot be the creator or the responsible person.
/// </summary>
public class EvaluationFinding : AuditableEntity
{
    public Guid EvaluationId { get; private set; }
    public string Finding { get; private set; } = string.Empty;
    public DacCriteria? DacCriteria { get; private set; }
    public string? Recommendation { get; private set; }
    public FindingStatus Status { get; private set; } = FindingStatus.Open;
    public int SortOrder { get; private set; }

    // Management Response (REQ-MEAL-015)
    public string? ManagementResponse { get; private set; }
    public Guid? ResponsibleUserId { get; private set; }
    public DateTimeOffset? ResponseDate { get; private set; }
    public DateTimeOffset? DueDate { get; private set; }

    // Verification (REQ-MEAL-016)
    public Guid? VerifiedByUserId { get; private set; }
    public DateTimeOffset? VerifiedAt { get; private set; }
    public string? VerificationNotes { get; private set; }

    public Guid OrganizationId { get; set; }

    // Navigation
    public Evaluation? Evaluation { get; private set; }

    public static EvaluationFinding Create(
        Guid evaluationId, string finding, Guid orgId,
        DacCriteria? dacCriteria = null, string? recommendation = null,
        int sortOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(finding))
            throw new ArgumentException("Finding text is required.", nameof(finding));

        return new EvaluationFinding
        {
            EvaluationId = evaluationId,
            Finding = finding.Trim(),
            DacCriteria = dacCriteria,
            Recommendation = recommendation,
            SortOrder = sortOrder,
            OrganizationId = orgId
        };
    }

    public void ProvideManagementResponse(string response, Guid responsibleUserId, DateTimeOffset? dueDate)
    {
        if (string.IsNullOrWhiteSpace(response))
            throw new ArgumentException("Management response is required.", nameof(response));

        ManagementResponse = response;
        ResponsibleUserId = responsibleUserId;
        ResponseDate = DateTimeOffset.UtcNow;
        DueDate = dueDate;
        Status = FindingStatus.ResponseProvided;
    }

    /// <summary>
    /// Verify the management response. Enforces separation of duties:
    /// verifier must not be the creator or the responsible person.
    /// </summary>
    public void Verify(Guid verifierUserId, string? notes)
    {
        if (Status != FindingStatus.ResponseProvided)
            throw new InvalidOperationException("Only findings with a management response can be verified.");

        // Separation of duties (REQ-MEAL-016)
        if (verifierUserId == ResponsibleUserId)
            throw new InvalidOperationException("Verifier cannot be the responsible person.");

        // CreatedBy is a string from audit interceptor
        if (!string.IsNullOrEmpty(CreatedBy) && CreatedBy == verifierUserId.ToString())
            throw new InvalidOperationException("Verifier cannot be the finding creator.");

        VerifiedByUserId = verifierUserId;
        VerifiedAt = DateTimeOffset.UtcNow;
        VerificationNotes = notes;
        Status = FindingStatus.Verified;
    }

    public void Close()
    {
        if (Status != FindingStatus.Verified)
            throw new InvalidOperationException("Only Verified findings can be closed.");
        Status = FindingStatus.Closed;
    }
}
