using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Domain.Entities;

/// <summary>
/// Discussion comments and feedback on a report.
/// Supports threaded discussions via ParentCommentId.
/// </summary>
public class ReportComment : AuditableEntity
{
    public Guid ReportId { get; private set; }
    public Guid UserId { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public Guid? ParentCommentId { get; private set; }

    public Guid OrganizationId { get; set; }

    // Navigation
    public Report? Report { get; private set; }
    public ReportComment? ParentComment { get; private set; }
    public ICollection<ReportComment> Replies { get; private set; } = [];

    public static ReportComment Create(Guid reportId, Guid userId, string content,
        Guid orgId, Guid? parentCommentId = null)
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Comment content is required.", nameof(content));

        return new ReportComment
        {
            ReportId = reportId,
            UserId = userId,
            Content = content.Trim(),
            ParentCommentId = parentCommentId,
            OrganizationId = orgId
        };
    }

    public void Edit(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Comment content is required.", nameof(content));
        Content = content.Trim();
    }
}
