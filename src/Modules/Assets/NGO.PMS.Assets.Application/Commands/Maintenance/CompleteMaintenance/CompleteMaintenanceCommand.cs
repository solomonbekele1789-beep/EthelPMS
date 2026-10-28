using MediatR;

namespace NGO.PMS.Assets.Application.Commands.Maintenance.CompleteMaintenance;

public sealed record CompleteMaintenanceCommand(
    Guid MaintenanceId,
    DateTime CompletedDate,
    decimal? Cost,
    string? PerformedBy,
    string? Notes,
    DateTime? NextScheduledDate) : IRequest<Unit>;
