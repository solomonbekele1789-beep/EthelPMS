using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Donors.Domain.Entities;

public class GrantReport : AuditableEntity, IMultiTenant
{
    public Guid GrantId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string ReportType { get; private set; } = string.Empty;
    public DateTime DueDate { get; private set; }
    public DateTime? SubmittedDate { get; private set; }
    public bool IsSubmitted { get; private set; }
    public string? FileUrl { get; private set; }
    public string? Notes { get; private set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private GrantReport() { }

    public static GrantReport Create(Guid grantId, string title, string reportType, DateTime dueDate, string? notes)
    {
        if (grantId == Guid.Empty)
            throw new ArgumentException("Grant ID is required.", nameof(grantId));
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Report title is required.", nameof(title));
        if (string.IsNullOrWhiteSpace(reportType))
            throw new ArgumentException("Report type is required.", nameof(reportType));

        return new GrantReport
        {
            GrantId = grantId,
            Title = title,
            ReportType = reportType,
            DueDate = dueDate,
            Notes = notes,
            IsSubmitted = false
        };
    }

    public void Submit(string? fileUrl)
    {
        IsSubmitted = true;
        SubmittedDate = DateTime.UtcNow;
        FileUrl = fileUrl;
    }

    public void MarkOverdue()
    {
        // Report is past due and not submitted — flagging for compliance tracking
    }
}
