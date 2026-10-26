using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Tasks;

/// <summary>
/// Fired when a task goes through approval.
/// Consumed by: Reporting (approval audit trail).
/// </summary>
public sealed record TaskApprovalIntegrationEvent : IntegrationEvent
{
    public Guid TaskId { get; init; }
    public Guid ApproverId { get; init; }
    public string Action { get; init; } = string.Empty;
}
