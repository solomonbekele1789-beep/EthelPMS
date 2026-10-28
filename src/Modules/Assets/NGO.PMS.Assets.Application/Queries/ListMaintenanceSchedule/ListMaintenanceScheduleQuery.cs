using MediatR;
using NGO.PMS.Assets.Application.DTOs;

namespace NGO.PMS.Assets.Application.Queries.ListMaintenanceSchedule;

public sealed record ListMaintenanceScheduleQuery(
    Guid? AssetId,
    bool? IsCompleted) : IRequest<List<AssetMaintenanceDto>>;
