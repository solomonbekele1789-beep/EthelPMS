using NGO.PMS.Reporting.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Domain.Entities;

/// <summary>
/// Tracks each approval/rejection action in the multi-level approval chain.
/// REQ-RPT-010: Report approval history tracking.
/// </summary>
public class ReportApproval : BaseEntity
{
    public Guid ReportId { get; private set; }
    public Guid UserId { get; private set; }
    public int ApprovalLevel { get; private set; }
    public ApprovalAction Action { get; private set; }
    public string? Comments { get; private set; }
    public DateTimeOffset ActionDate { get; private set; }

    public Guid OrganizationId { get; set; }

    // Navigation
    public Report? Report { get; private set; }

    public static ReportApproval Create(
        Guid reportId, Guid userId, int approvalLevel,
        ApprovalAction action, string? comments = null)
    {
        return new ReportApproval
        {
            ReportId = reportId,
            UserId = userId,
            ApprovalLevel = approvalLevel,
            Action = action,
            Comments = comments,
            ActionDate = DateTimeOffset.UtcNow
        };
    }
}
