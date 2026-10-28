using NGO.PMS.Partnerships.Domain.Enums;
using NGO.PMS.Partnerships.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Partnerships.Domain.Entities;

public class PartnerReport : AuditableEntity, IMultiTenant
{
    public Guid OrganizationId { get; private set; }
    public Guid SubGranteeId { get; private set; }
    public PartnerReportType ReportType { get; private set; }
    public DateTime ReportingPeriodStart { get; private set; }
    public DateTime ReportingPeriodEnd { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Narrative { get; private set; }
    public string? FinancialSummaryJson { get; private set; }
    public DateTime? SubmittedAt { get; private set; }
    public Guid? ReviewedById { get; private set; }
    public DateTime? ReviewedAt { get; private set; }
    public ReportStatus Status { get; private set; }
    public string? ReviewComments { get; private set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private PartnerReport() { }

    public static PartnerReport Create(
        Guid organizationId,
        Guid subGranteeId,
        PartnerReportType reportType,
        DateTime reportingPeriodStart,
        DateTime reportingPeriodEnd,
        string title)
    {
        if (subGranteeId == Guid.Empty)
            throw new ArgumentException("Sub-grantee ID is required.", nameof(subGranteeId));
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));
        if (reportingPeriodEnd <= reportingPeriodStart)
            throw new ArgumentException("Reporting period end must be after start.", nameof(reportingPeriodEnd));

        return new PartnerReport
        {
            OrganizationId = organizationId,
            SubGranteeId = subGranteeId,
            ReportType = reportType,
            ReportingPeriodStart = reportingPeriodStart,
            ReportingPeriodEnd = reportingPeriodEnd,
            Title = title,
            Status = ReportStatus.Draft
        };
    }

    public void Submit(string? narrative, string? financialSummaryJson)
    {
        if (Status != ReportStatus.Draft && Status != ReportStatus.RevisionRequested)
            throw new InvalidOperationException("Only draft or revision-requested reports can be submitted.");

        Narrative = narrative;
        FinancialSummaryJson = financialSummaryJson;
        Status = ReportStatus.Submitted;
        SubmittedAt = DateTime.UtcNow;

        AddDomainEvent(new PartnerReportSubmittedEvent(Id, SubGranteeId, ReportType.ToString()));
    }

    public void Review(Guid reviewerId, ReportStatus status, string? comments)
    {
        if (Status != ReportStatus.Submitted && Status != ReportStatus.UnderReview)
            throw new InvalidOperationException("Only submitted or under-review reports can be reviewed.");

        if (status != ReportStatus.Approved && status != ReportStatus.Rejected && status != ReportStatus.RevisionRequested)
            throw new ArgumentException("Review status must be Approved, Rejected, or RevisionRequested.", nameof(status));

        ReviewedById = reviewerId;
        ReviewedAt = DateTime.UtcNow;
        Status = status;
        ReviewComments = comments;
    }
}
