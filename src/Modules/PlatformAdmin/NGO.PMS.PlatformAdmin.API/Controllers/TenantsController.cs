using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ActivateTenant;
using NGO.PMS.PlatformAdmin.Application.Tenants.Commands.CreateTenant;
using NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ProvisionTenant;
using NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ReactivateTenant;
using NGO.PMS.PlatformAdmin.Application.Tenants.Commands.SuspendTenant;
using NGO.PMS.PlatformAdmin.Application.Tenants.Commands.UpdateTenant;
using NGO.PMS.PlatformAdmin.Application.Tenants.Commands.UpdateTenantBranding;
using NGO.PMS.PlatformAdmin.Application.Tenants.Commands.UpdateSubscription;
using NGO.PMS.PlatformAdmin.Application.Tenants.Queries.GetProvisioningStatus;
using NGO.PMS.PlatformAdmin.Application.Tenants.Queries.GetTenant;
using NGO.PMS.PlatformAdmin.Application.Tenants.Queries.GetTenantUsage;
using NGO.PMS.PlatformAdmin.Application.Tenants.Queries.ListTenants;

namespace NGO.PMS.PlatformAdmin.API.Controllers;

[ApiController]
[Route("api/v1/platform/tenants")]
[Authorize(Policy = "SuperAdmin")]
public class TenantsController : ControllerBase
{
    private readonly ISender _mediator;
    public TenantsController(ISender mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null, [FromQuery] string? status = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListTenantsQuery(page, pageSize, search, status), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTenantQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTenantCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTenantCommand command, CancellationToken ct)
    {
        if (id != command.TenantId)
            return BadRequest(new { message = "Route ID does not match body TenantId." });
        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/provision")]
    public async Task<IActionResult> Provision(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ProvisionTenantCommand(id), ct);
        return Accepted(new { message = "Provisioning started." });
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ActivateTenantCommand(id), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/suspend")]
    public async Task<IActionResult> Suspend(Guid id, [FromBody] SuspendTenantCommand command, CancellationToken ct)
    {
        if (id != command.TenantId)
            return BadRequest(new { message = "Route ID does not match body TenantId." });
        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/reactivate")]
    public async Task<IActionResult> Reactivate(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ReactivateTenantCommand(id), ct);
        return NoContent();
    }

    [HttpPut("{id:guid}/branding")]
    public async Task<IActionResult> UpdateBranding(Guid id, [FromBody] UpdateTenantBrandingCommand command, CancellationToken ct)
    {
        if (id != command.TenantId)
            return BadRequest(new { message = "Route ID does not match body TenantId." });
        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpPut("{id:guid}/subscription")]
    public async Task<IActionResult> UpdateSubscription(Guid id, [FromBody] UpdateSubscriptionCommand command, CancellationToken ct)
    {
        if (id != command.TenantId)
            return BadRequest(new { message = "Route ID does not match body TenantId." });
        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpGet("{id:guid}/usage")]
    public async Task<IActionResult> GetUsage(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTenantUsageQuery(id), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}/provisioning")]
    public async Task<IActionResult> GetProvisioningStatus(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetProvisioningStatusQuery(id), ct);
        return Ok(result);
    }
}
