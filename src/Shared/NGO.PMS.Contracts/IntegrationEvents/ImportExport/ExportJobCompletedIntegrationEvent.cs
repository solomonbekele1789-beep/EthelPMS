using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.ImportExport;

/// <summary>
/// Published when a data export job completes.
/// Consumed by: Notifications, Documents.
/// </summary>
public sealed record ExportJobCompletedIntegrationEvent : IntegrationEvent
{
    public Guid JobId { get; init; }
    public string Module { get; init; } = string.Empty;
    public string ExportFormat { get; init; } = string.Empty;
}
