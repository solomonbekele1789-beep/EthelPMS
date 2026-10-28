using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Settings.Application.ApprovalConfigs.Commands.CreateApprovalConfig;
using NGO.PMS.Settings.Application.ApprovalConfigs.Commands.UpdateApprovalConfig;
using NGO.PMS.Settings.Application.ApprovalConfigs.Queries.GetApprovalConfigs;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Settings.API.Controllers;

[ApiController]
[Route("api/v1/approval-configs")]
[Authorize]
public class ApprovalConfigsController : ControllerBase
{
    private readonly ISender _sender;

    public ApprovalConfigsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("settings.approvals.create")]
    public async Task<IActionResult> Create([FromBody] CreateApprovalConfigCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(List), null, new { id });
    }

    [HttpGet]
    [RequirePermission("settings.approvals.read")]
    public async Task<IActionResult> List([FromQuery] string? module = null)
    {
        var result = await _sender.Send(new GetApprovalConfigsQuery(module));
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("settings.approvals.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateApprovalConfigCommand command)
    {
        if (id != command.Id)
            return BadRequest("Route id does not match command Id.");

        await _sender.Send(command);
        return NoContent();
    }
}
