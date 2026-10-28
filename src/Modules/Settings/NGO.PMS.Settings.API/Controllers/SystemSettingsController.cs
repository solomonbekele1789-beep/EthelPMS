using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Settings.Application.SystemSettings.Commands.UpdateSystemSetting;
using NGO.PMS.Settings.Application.SystemSettings.Queries.GetSystemSettings;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Settings.API.Controllers;

[ApiController]
[Route("api/v1/system-settings")]
[Authorize]
public class SystemSettingsController : ControllerBase
{
    private readonly ISender _sender;

    public SystemSettingsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("settings.system.manage")]
    public async Task<IActionResult> List([FromQuery] string? category = null)
    {
        var result = await _sender.Send(new GetSystemSettingsQuery(category));
        return Ok(result);
    }

    [HttpPut("{key}")]
    [RequirePermission("settings.system.manage")]
    public async Task<IActionResult> Update(string key, [FromBody] UpdateSystemSettingCommand command)
    {
        if (key != command.SettingKey)
            return BadRequest("Route key does not match command SettingKey.");

        await _sender.Send(command);
        return NoContent();
    }
}
