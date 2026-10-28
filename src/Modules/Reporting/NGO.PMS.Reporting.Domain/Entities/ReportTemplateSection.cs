using NGO.PMS.Reporting.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Domain.Entities;

/// <summary>
/// A section definition within a report template.
/// Defines what data a report of this type should contain.
/// </summary>
public class ReportTemplateSection : BaseEntity
{
    public Guid ReportTemplateId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public SectionType SectionType { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsRequired { get; private set; } = true;

    /// <summary>
    /// Instructions or guidance for filling in this section.
    /// </summary>
    public string? Instructions { get; private set; }

    // Navigation
    public ReportTemplate? ReportTemplate { get; private set; }

    public static ReportTemplateSection Create(
        Guid templateId, string title, SectionType sectionType,
        int sortOrder, bool isRequired = true, string? instructions = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Section title is required.", nameof(title));

        return new ReportTemplateSection
        {
            ReportTemplateId = templateId,
            Title = title.Trim(),
            SectionType = sectionType,
            SortOrder = sortOrder,
            IsRequired = isRequired,
            Instructions = instructions
        };
    }

    public void Update(string title, SectionType sectionType, int sortOrder,
        bool isRequired, string? instructions)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Section title is required.", nameof(title));
        Title = title.Trim();
        SectionType = sectionType;
        SortOrder = sortOrder;
        IsRequired = isRequired;
        Instructions = instructions;
    }
}
