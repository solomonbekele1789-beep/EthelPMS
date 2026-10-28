using NGO.PMS.Reporting.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Domain.Entities;

/// <summary>
/// Defines the structure of a report type for an organization.
/// Each org can customize templates per report type with configurable sections
/// and approval chain levels.
/// </summary>
public class ReportTemplate : AuditableEntity, ISoftDeletable
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public ReportType ReportType { get; private set; }
    public bool IsActive { get; private set; } = true;

    /// <summary>
    /// Number of approval levels required (1 = single approver, 2+ = multi-level).
    /// REQ-RPT-009: Configurable approval chain per report type.
    /// </summary>
    public int RequiredApprovalLevels { get; private set; } = 1;

    /// <summary>
    /// Deadline offset in days from period end for report submission.
    /// REQ-RPT-019: Report assignment management — deadlines.
    /// </summary>
    public int SubmissionDeadlineDays { get; private set; } = 7;

    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public ICollection<ReportTemplateSection> Sections { get; private set; } = [];

    public static ReportTemplate Create(
        string name, ReportType reportType, Guid orgId,
        int requiredApprovalLevels = 1, int submissionDeadlineDays = 7,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Template name is required.", nameof(name));
        if (requiredApprovalLevels < 1)
            throw new ArgumentException("At least one approval level is required.", nameof(requiredApprovalLevels));

        return new ReportTemplate
        {
            Name = name.Trim(),
            Description = description,
            ReportType = reportType,
            RequiredApprovalLevels = requiredApprovalLevels,
            SubmissionDeadlineDays = submissionDeadlineDays,
            OrganizationId = orgId
        };
    }

    public void Update(string name, string? description, int requiredApprovalLevels, int submissionDeadlineDays)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Template name is required.", nameof(name));
        Name = name.Trim();
        Description = description;
        RequiredApprovalLevels = requiredApprovalLevels;
        SubmissionDeadlineDays = submissionDeadlineDays;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public ReportTemplateSection AddSection(
        string title, SectionType sectionType, int sortOrder,
        bool isRequired = true, string? instructions = null)
    {
        var section = ReportTemplateSection.Create(Id, title, sectionType, sortOrder, isRequired, instructions);
        Sections.Add(section);
        return section;
    }
}
