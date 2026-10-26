using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.PlatformAdmin.Application.AccessKeys.Commands.CreateAccessKey;
using NGO.PMS.PlatformAdmin.Application.AccessKeys.Commands.RevokeAccessKey;
using NGO.PMS.PlatformAdmin.Application.AccessKeys.Queries.ListAccessKeys;

namespace NGO.PMS.PlatformAdmin.API.Controllers;

[ApiController]
[Route("api/v1/platform/tenants/{tenantId:guid}/keys")]
[Authorize(Policy = "SuperAdmin")]
public class AccessKeysController : ControllerBase
{
    private readonly ISender _mediator;
    public AccessKeysController(ISender mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List(Guid tenantId, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListAccessKeysQuery(tenantId), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        Guid tenantId, [FromBody] CreateAccessKeyRequest request, CancellationToken ct)
    {
        var rawKey = await _mediator.Send(
            new CreateAccessKeyCommand(tenantId, request.Label, request.Scopes, request.ExpiresAt), ct);
        return Ok(new { key = rawKey, message = "Store this key securely. It will not be shown again." });
    }

    [HttpDelete("{keyId:guid}")]
    public async Task<IActionResult> Revoke(Guid tenantId, Guid keyId, CancellationToken ct)
    {
        await _mediator.Send(new RevokeAccessKeyCommand(keyId), ct);
        return NoContent();
    }
}

public record CreateAccessKeyRequest(string Label, string[] Scopes, DateTimeOffset? ExpiresAt);
