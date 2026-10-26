using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Identity.Application.Locations.Queries.ListLocations;
using NGO.PMS.Identity.Domain.Enums;

namespace NGO.PMS.Identity.API.Controllers;

[ApiController]
[Route("api/v1/locations")]
[Authorize]
public class LocationsController : ControllerBase
{
    private readonly ISender _mediator;
    public LocationsController(ISender mediator) => _mediator = mediator;

    [HttpGet("regions")]
    public async Task<IActionResult> ListRegions(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListLocationsQuery(LocationLevel.Region), ct);
        return Ok(result);
    }

    [HttpGet("regions/{id:guid}/zones")]
    public async Task<IActionResult> ListZones(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListLocationsQuery(LocationLevel.Zone, id), ct);
        return Ok(result);
    }

    [HttpGet("zones/{id:guid}/woredas")]
    public async Task<IActionResult> ListWoredas(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListLocationsQuery(LocationLevel.Woreda, id), ct);
        return Ok(result);
    }

    [HttpGet("woredas/{id:guid}/kebeles")]
    public async Task<IActionResult> ListKebeles(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListLocationsQuery(LocationLevel.Kebele, id), ct);
        return Ok(result);
    }
}
