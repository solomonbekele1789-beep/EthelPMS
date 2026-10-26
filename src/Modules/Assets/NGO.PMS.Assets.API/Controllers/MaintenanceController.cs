using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Assets.Application.Commands.Maintenance.CompleteMaintenance;
using NGO.PMS.Assets.Application.Commands.Maintenance.ScheduleMaintenance;
using NGO.PMS.Assets.Application.Queries.ListMaintenanceSchedule;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Assets.API.Controllers;

[ApiController]
[Route("api/v1/asset-maintenance")]
[Authorize]
public class MaintenanceController : ControllerBase
{
    private readonly ISender _sender;
    public MaintenanceController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("assets.maintenance.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? assetId,
        [FromQuery] bool? isCompleted)
        => Ok(await _sender.Send(new ListMaintenanceScheduleQuery(assetId, isCompleted)));

    [HttpPost]
    [RequirePermission("assets.maintenance.create")]
    public async Task<IActionResult> Schedule(ScheduleMaintenanceCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/asset-maintenance/{id}", new { id });
    }

    [HttpPut("{id:guid}/complete")]
    [RequirePermission("assets.maintenance.complete")]
    public async Task<IActionResult> Complete(Guid id, CompleteMaintenanceCommand command)
    {
        if (id != command.MaintenanceId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
