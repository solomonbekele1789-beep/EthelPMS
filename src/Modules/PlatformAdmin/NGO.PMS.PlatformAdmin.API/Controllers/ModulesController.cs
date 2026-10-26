using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ToggleModule;

namespace NGO.PMS.PlatformAdmin.API.Controllers;

[ApiController]
[Route("api/v1/platform/tenants/{tenantId:guid}/modules")]
[Authorize(Policy = "SuperAdmin")]
public class ModulesController : ControllerBase
{
    private readonly ISender _mediator;
    public ModulesController(ISender mediator) => _mediator = mediator;

    [HttpPut("{moduleName}")]
    public async Task<IActionResult> Toggle(
        Guid tenantId, string moduleName, [FromBody] ToggleModuleRequest request, CancellationToken ct)
    {
        await _mediator.Send(new ToggleModuleCommand(tenantId, moduleName, request.Enabled), ct);
        return NoContent();
    }
}

public record ToggleModuleRequest(bool Enabled);
