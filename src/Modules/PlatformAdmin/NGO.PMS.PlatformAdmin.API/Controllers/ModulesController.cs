using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ToggleModule;
using NGO.PMS.PlatformAdmin.Application.Tenants.Queries.ListTenantModules;

namespace NGO.PMS.PlatformAdmin.API.Controllers;

[ApiController]
[Route("api/v1/platform/tenants/{tenantId:guid}/modules")]
[Authorize(Policy = "SuperAdmin")]
public class ModulesController : ControllerBase
{
    private readonly ISender _mediator;
    public ModulesController(ISender mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List(Guid tenantId, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListTenantModulesQuery(tenantId), ct);
        return Ok(result);
    }

    [HttpPut("{moduleName}")]
    public async Task<IActionResult> Toggle(
        Guid tenantId, string moduleName, [FromBody] ToggleModuleRequest request, CancellationToken ct)
    {
        await _mediator.Send(new ToggleModuleCommand(tenantId, moduleName, request.Enabled), ct);
        return Ok(new { success = true, message = $"Module '{moduleName}' {(request.Enabled ? "enabled" : "disabled")}." });
    }
}

public record ToggleModuleRequest(bool Enabled);
