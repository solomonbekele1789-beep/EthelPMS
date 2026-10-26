namespace NGO.PMS.Reporting.Domain.Enums;

/// <summary>
/// Categorizes report template sections for rendering and aggregation.
/// </summary>
public enum SectionType
{
    Narrative = 1,
    Financial = 2,
    Indicator = 3,
    Beneficiary = 4,
    Risk = 5,
    Challenge = 6,
    Custom = 7
}
