using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.SharedKernel.Authorization;
using NGO.PMS.Identity.Application.Roles.Commands.AssignRoleToUser;
using NGO.PMS.Identity.Application.Roles.Commands.RemoveRoleFromUser;
using NGO.PMS.Identity.Application.Users.Commands.ActivateUser;
using NGO.PMS.Identity.Application.Users.Commands.ChangeUserPassword;
using NGO.PMS.Identity.Application.Users.Commands.CreateUser;
using NGO.PMS.Identity.Application.Users.Commands.DeactivateUser;
using NGO.PMS.Identity.Application.Users.Commands.UpdateUser;
using NGO.PMS.Identity.Application.Users.Queries.GetCurrentUser;
using NGO.PMS.Identity.Application.Users.Queries.GetUser;
using NGO.PMS.Identity.Application.Users.Queries.ListUsers;

namespace NGO.PMS.Identity.API.Controllers;

[ApiController]
[Route("api/v1/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ISender _mediator;
    public UsersController(ISender mediator) => _mediator = mediator;

    [HttpGet]
    [RequirePermission("identity.users.read")]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? officeId = null,
        [FromQuery] bool? isActive = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(
            new ListUsersQuery(page, pageSize, search, officeId, isActive), ct);
        return Ok(result);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetCurrentUserQuery(), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("identity.users.read")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetUserQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("identity.users.create")]
    public async Task<IActionResult> Create([FromBody] CreateUserCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("identity.users.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserCommand command, CancellationToken ct)
    {
        if (id != command.Id)
            return BadRequest(new { message = "Route ID does not match body ID." });
        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/deactivate")]
    [RequirePermission("identity.users.manage")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeactivateUserCommand(id), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/activate")]
    [RequirePermission("identity.users.manage")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ActivateUserCommand(id), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/roles")]
    [RequirePermission("identity.users.manage")]
    public async Task<IActionResult> AssignRole(Guid id, [FromBody] AssignRoleRequest request, CancellationToken ct)
    {
        await _mediator.Send(new AssignRoleToUserCommand(id, request.RoleId), ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}/roles/{roleId:guid}")]
    [RequirePermission("identity.users.manage")]
    public async Task<IActionResult> RemoveRole(Guid id, Guid roleId, CancellationToken ct)
    {
        await _mediator.Send(new RemoveRoleFromUserCommand(id, roleId), ct);
        return NoContent();
    }

    [HttpPost("me/change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangeUserPasswordCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return Ok(new { message = "Password changed successfully." });
    }
}

public record AssignRoleRequest(Guid RoleId);
