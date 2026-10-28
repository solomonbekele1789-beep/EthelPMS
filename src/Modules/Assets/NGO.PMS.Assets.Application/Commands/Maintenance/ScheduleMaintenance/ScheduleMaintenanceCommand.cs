using MediatR;

namespace NGO.PMS.Assets.Application.Commands.Maintenance.ScheduleMaintenance;

public sealed record ScheduleMaintenanceCommand(
    Guid AssetId,
    string Description,
    DateTime ScheduledDate) : IRequest<Guid>;
