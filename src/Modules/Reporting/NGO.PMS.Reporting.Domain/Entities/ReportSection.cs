using NGO.PMS.Reporting.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Domain.Entities;

/// <summary>
/// A section within a report instance, optionally linked to a template section.
/// Contains narrative content and aggregated data for the section.
/// </summary>
public class ReportSection : AuditableEntity
{
    public Guid ReportId { get; private set; }
    public Guid? TemplateSectionId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public SectionType SectionType { get; private set; }
    public int SortOrder { get; private set; }
    public string? Content { get; private set; }

    public Guid OrganizationId { get; set; }

    // Navigation
    public Report? Report { get; private set; }
    public ReportTemplateSection? TemplateSection { get; private set; }
    public ICollection<ReportDataEntry> DataEntries { get; private set; } = [];

    public static ReportSection Create(
        Guid reportId, string title, SectionType sectionType,
        int sortOrder, Guid orgId, Guid? templateSectionId = null,
        string? content = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Section title is required.", nameof(title));

        return new ReportSection
        {
            ReportId = reportId,
            TemplateSectionId = templateSectionId,
            Title = title.Trim(),
            SectionType = sectionType,
            SortOrder = sortOrder,
            Content = content,
            OrganizationId = orgId
        };
    }

    public void Update(string title, string? content, int sortOrder)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Section title is required.", nameof(title));
        Title = title.Trim();
        Content = content;
        SortOrder = sortOrder;
    }
}
