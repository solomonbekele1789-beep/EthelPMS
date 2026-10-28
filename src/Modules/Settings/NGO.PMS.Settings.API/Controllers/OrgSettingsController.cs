using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Settings.Application.OrgSettings.Commands.UpsertOrgSetting;
using NGO.PMS.Settings.Application.OrgSettings.Queries.GetOrgSettingByKey;
using NGO.PMS.Settings.Application.OrgSettings.Queries.GetOrgSettings;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Settings.API.Controllers;

[ApiController]
[Route("api/v1/org-settings")]
[Authorize]
public class OrgSettingsController : ControllerBase
{
    private readonly ISender _sender;

    public OrgSettingsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("settings.org.manage")]
    public async Task<IActionResult> List([FromQuery] string? module = null, [FromQuery] string? category = null)
    {
        var result = await _sender.Send(new GetOrgSettingsQuery(module, category));
        return Ok(result);
    }

    [HttpGet("{key}")]
    [RequirePermission("settings.org.manage")]
    public async Task<IActionResult> GetByKey(string key)
    {
        var result = await _sender.Send(new GetOrgSettingByKeyQuery(key));
        return result is not null ? Ok(result) : NotFound();
    }

    [HttpPut]
    [RequirePermission("settings.org.manage")]
    public async Task<IActionResult> Upsert([FromBody] UpsertOrgSettingCommand command)
    {
        var id = await _sender.Send(command);
        return Ok(new { id });
    }
}
