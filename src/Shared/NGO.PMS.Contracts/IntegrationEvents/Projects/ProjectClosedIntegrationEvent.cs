namespace NGO.PMS.Contracts.IntegrationEvents.Projects;

/// <summary>
/// Published when a project is closed or cancelled.
/// Consumed by: Planning (archive plans), FundAccounting (close budget lines),
/// Tasks (close remaining tasks), Notifications (notify team).
/// </summary>
public sealed record ProjectClosedIntegrationEvent : IntegrationEvent
{
    public Guid ProjectId { get; init; }
    public string Code { get; init; } = string.Empty;
    public Guid ClosedByUserId { get; init; }
    public string Reason { get; init; } = string.Empty;
    public bool IsCancellation { get; init; }
}
