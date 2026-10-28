namespace NGO.PMS.Reporting.Domain.Enums;

/// <summary>
/// Multi-level approval workflow: Draft → Submitted → UnderReview → Approved/Rejected.
/// </summary>
public enum ReportStatus
{
    Draft = 1,
    Submitted = 2,
    UnderReview = 3,
    Approved = 4,
    Rejected = 5
}
