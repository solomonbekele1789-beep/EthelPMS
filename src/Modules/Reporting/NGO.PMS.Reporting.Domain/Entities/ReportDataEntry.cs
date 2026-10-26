using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Domain.Entities;

/// <summary>
/// Granular key-value data within a report section.
/// Used for financial figures, indicator values, beneficiary counts, etc.
/// Supports both numeric and text values.
/// </summary>
public class ReportDataEntry : BaseEntity
{
    public Guid ReportSectionId { get; private set; }
    public string Key { get; private set; } = string.Empty;
    public string? Label { get; private set; }
    public string? StringValue { get; private set; }
    public decimal? NumericValue { get; private set; }
    public int SortOrder { get; private set; }

    /// <summary>
    /// Optional link to an indicator or activity for traceability.
    /// </summary>
    public Guid? IndicatorId { get; private set; }
    public Guid? ActivityId { get; private set; }

    public Guid OrganizationId { get; set; }

    // Navigation
    public ReportSection? ReportSection { get; private set; }

    public static ReportDataEntry Create(
        Guid sectionId, string key, Guid orgId,
        string? label = null, string? stringValue = null,
        decimal? numericValue = null, int sortOrder = 0,
        Guid? indicatorId = null, Guid? activityId = null)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Data entry key is required.", nameof(key));

        return new ReportDataEntry
        {
            ReportSectionId = sectionId,
            Key = key.Trim(),
            Label = label,
            StringValue = stringValue,
            NumericValue = numericValue,
            SortOrder = sortOrder,
            IndicatorId = indicatorId,
            ActivityId = activityId,
            OrganizationId = orgId
        };
    }

    public void Update(string? label, string? stringValue, decimal? numericValue)
    {
        Label = label;
        StringValue = stringValue;
        NumericValue = numericValue;
    }
}
