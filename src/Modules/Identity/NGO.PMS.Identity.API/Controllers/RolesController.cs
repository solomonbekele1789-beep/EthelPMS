using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.SharedKernel.Authorization;
using NGO.PMS.Identity.Application.Roles.Commands.CreateRole;
using NGO.PMS.Identity.Application.Roles.Commands.DeleteRole;
using NGO.PMS.Identity.Application.Roles.Commands.UpdateRole;
using NGO.PMS.Identity.Application.Roles.Queries.GetRole;
using NGO.PMS.Identity.Application.Roles.Queries.ListPermissions;
using NGO.PMS.Identity.Application.Roles.Queries.ListRoles;

namespace NGO.PMS.Identity.API.Controllers;

[ApiController]
[Route("api/v1/roles")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly ISender _mediator;
    public RolesController(ISender mediator) => _mediator = mediator;

    [HttpGet]
    [RequirePermission("identity.roles.read")]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListRolesQuery(page, pageSize, search), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("identity.roles.read")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetRoleQuery(id), ct);
        return Ok(result);
    }

    [HttpGet("permissions")]
    [RequirePermission("identity.roles.read")]
    public async Task<IActionResult> ListPermissions([FromQuery] string? module = null, CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListPermissionsQuery(module), ct);
        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("identity.roles.create")]
    public async Task<IActionResult> Create([FromBody] CreateRoleCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("identity.roles.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoleCommand command, CancellationToken ct)
    {
        if (id != command.Id)
            return BadRequest(new { message = "Route ID does not match body ID." });
        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("identity.roles.delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteRoleCommand(id), ct);
        return NoContent();
    }
}
