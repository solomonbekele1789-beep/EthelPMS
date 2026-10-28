namespace NGO.PMS.Planning.Application.DTOs;

public class PlanIndicatorAllocationDto
{
    public Guid Id { get; set; }
    public Guid IndicatorId { get; set; }
    public decimal TargetValue { get; set; }
    public decimal? ActualValue { get; set; }
}
