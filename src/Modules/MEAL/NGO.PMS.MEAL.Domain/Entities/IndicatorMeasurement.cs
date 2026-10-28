using NGO.PMS.MEAL.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Domain.Entities;

/// <summary>
/// Actual measured value for a MEAL indicator at a specific period.
/// Supports disaggregated data and data quality notes.
/// </summary>
public class IndicatorMeasurement : AuditableEntity
{
    public Guid MealIndicatorId { get; private set; }
    public string Period { get; private set; } = string.Empty;
    public decimal Value { get; private set; }
    public decimal? DisaggregatedMale { get; private set; }
    public decimal? DisaggregatedFemale { get; private set; }
    public string? Notes { get; private set; }
    public string? DataQualityNotes { get; private set; }
    public DateTimeOffset MeasurementDate { get; private set; }
    public Guid? CollectedByUserId { get; private set; }

    public Guid OrganizationId { get; set; }

    // Navigation
    public MealIndicator? MealIndicator { get; private set; }

    public static IndicatorMeasurement Create(
        Guid mealIndicatorId, string period, decimal value,
        DateTimeOffset measurementDate, Guid orgId,
        Guid? collectedByUserId = null, string? notes = null,
        decimal? male = null, decimal? female = null)
    {
        if (string.IsNullOrWhiteSpace(period))
            throw new ArgumentException("Period is required.", nameof(period));

        var measurement = new IndicatorMeasurement
        {
            MealIndicatorId = mealIndicatorId,
            Period = period.Trim(),
            Value = value,
            MeasurementDate = measurementDate,
            CollectedByUserId = collectedByUserId,
            Notes = notes,
            DisaggregatedMale = male,
            DisaggregatedFemale = female,
            OrganizationId = orgId
        };
        measurement.AddDomainEvent(new IndicatorMeasurementRecordedEvent(
            measurement.Id, mealIndicatorId, value, period));
        return measurement;
    }

    public void Update(decimal value, string? notes, string? dataQualityNotes,
        decimal? male = null, decimal? female = null)
    {
        Value = value;
        Notes = notes;
        DataQualityNotes = dataQualityNotes;
        DisaggregatedMale = male;
        DisaggregatedFemale = female;
    }
}
