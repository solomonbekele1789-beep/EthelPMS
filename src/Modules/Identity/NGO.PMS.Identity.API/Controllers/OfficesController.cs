using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.SharedKernel.Authorization;
using NGO.PMS.Identity.Application.Offices.Commands.CreateOffice;
using NGO.PMS.Identity.Application.Offices.Commands.DeleteOffice;
using NGO.PMS.Identity.Application.Offices.Commands.UpdateOffice;
using NGO.PMS.Identity.Application.Offices.Queries.GetOffice;
using NGO.PMS.Identity.Application.Offices.Queries.ListOffices;

namespace NGO.PMS.Identity.API.Controllers;

[ApiController]
[Route("api/v1/offices")]
[Authorize]
public class OfficesController : ControllerBase
{
    private readonly ISender _mediator;
    public OfficesController(ISender mediator) => _mediator = mediator;

    [HttpGet]
    [RequirePermission("identity.offices.read")]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ListOfficesQuery(page, pageSize, search), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("identity.offices.read")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOfficeQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("identity.offices.create")]
    public async Task<IActionResult> Create([FromBody] CreateOfficeCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("identity.offices.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOfficeCommand command, CancellationToken ct)
    {
        if (id != command.Id)
            return BadRequest(new { message = "Route ID does not match body ID." });
        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("identity.offices.delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteOfficeCommand(id), ct);
        return NoContent();
    }
}
