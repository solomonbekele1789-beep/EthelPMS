using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.SharedKernel.Authorization;
using NGO.PMS.Identity.Application.Organizations.Commands.UpdateOrganization;
using NGO.PMS.Identity.Application.Organizations.Queries.GetOrganization;

namespace NGO.PMS.Identity.API.Controllers;

[ApiController]
[Route("api/v1/organizations")]
[Authorize]
public class OrganizationsController : ControllerBase
{
    private readonly ISender _mediator;
    public OrganizationsController(ISender mediator) => _mediator = mediator;

    [HttpGet]
    [RequirePermission("orgsetup.organization.read")]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOrganizationQuery(), ct);
        return Ok(result);
    }

    [HttpPut]
    [RequirePermission("orgsetup.organization.update")]
    public async Task<IActionResult> Update([FromBody] UpdateOrganizationCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return NoContent();
    }
}
