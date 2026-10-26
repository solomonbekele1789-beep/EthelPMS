namespace NGO.PMS.Planning.Application.DTOs;

public class PlanActivityDto
{
    public Guid Id { get; set; }
    public Guid PlanEntryId { get; set; }
    public Guid? OutcomeId { get; set; }
    public Guid? OutputId { get; set; }
    public Guid? ActivityId { get; set; }
    public decimal PlannedBudget { get; set; }
    public Guid? ResponsibleUserId { get; set; }
}
