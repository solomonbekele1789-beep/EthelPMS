using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Settings.Application.AlertThresholds.Commands.CreateAlertThreshold;
using NGO.PMS.Settings.Application.AlertThresholds.Commands.DeleteAlertThreshold;
using NGO.PMS.Settings.Application.AlertThresholds.Commands.UpdateAlertThreshold;
using NGO.PMS.Settings.Application.AlertThresholds.Queries.GetAlertThresholds;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Settings.API.Controllers;

[ApiController]
[Route("api/v1/alert-thresholds")]
[Authorize]
public class AlertThresholdsController : ControllerBase
{
    private readonly ISender _sender;

    public AlertThresholdsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("settings.alerts.create")]
    public async Task<IActionResult> Create([FromBody] CreateAlertThresholdCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(List), null, new { id });
    }

    [HttpGet]
    [RequirePermission("settings.alerts.read")]
    public async Task<IActionResult> List([FromQuery] string? module = null)
    {
        var result = await _sender.Send(new GetAlertThresholdsQuery(module));
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("settings.alerts.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAlertThresholdCommand command)
    {
        if (id != command.Id)
            return BadRequest("Route id does not match command Id.");

        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("settings.alerts.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteAlertThresholdCommand(id));
        return NoContent();
    }
}
