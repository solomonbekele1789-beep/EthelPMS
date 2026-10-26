namespace NGO.PMS.MEAL.Application.DTOs;

public class IndicatorMeasurementDto
{
    public Guid Id { get; set; }
    public Guid MealIndicatorId { get; set; }
    public string Period { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public decimal? DisaggregatedMale { get; set; }
    public decimal? DisaggregatedFemale { get; set; }
    public string? Notes { get; set; }
    public string? DataQualityNotes { get; set; }
    public DateTimeOffset MeasurementDate { get; set; }
    public Guid? CollectedByUserId { get; set; }
}
