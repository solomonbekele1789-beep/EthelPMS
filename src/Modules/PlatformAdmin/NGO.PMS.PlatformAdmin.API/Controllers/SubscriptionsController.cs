using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.PlatformAdmin.Application.Subscriptions.Queries.ListSubscriptionPackages;

namespace NGO.PMS.PlatformAdmin.API.Controllers;

[ApiController]
[Route("api/v1/platform/subscriptions")]
[Authorize(Policy = "SuperAdmin")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISender _mediator;
    public SubscriptionsController(ISender mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListSubscriptionPackagesQuery(), ct);
        return Ok(result);
    }
}
