using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Donors.Application.Commands.AddDonorContact;
using NGO.PMS.Donors.Application.Commands.CreateDonor;
using NGO.PMS.Donors.Application.Commands.UpdateDonor;
using NGO.PMS.Donors.Application.Queries.GetDonor;
using NGO.PMS.Donors.Application.Queries.ListDonors;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Donors.API.Controllers;

[ApiController]
[Route("api/v1/donors")]
[Authorize]
public class DonorsController : ControllerBase
{
    private readonly ISender _sender;

    public DonorsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("donors.donors.read")]
    public async Task<IActionResult> List(
        [FromQuery] bool? isActive,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _sender.Send(new ListDonorsQuery(isActive, search, page, pageSize)));

    [HttpGet("{id:guid}")]
    [RequirePermission("donors.donors.read")]
    public async Task<IActionResult> Get(Guid id)
        => Ok(await _sender.Send(new GetDonorQuery(id)));

    [HttpPost]
    [RequirePermission("donors.donors.create")]
    public async Task<IActionResult> Create(CreateDonorCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("donors.donors.update")]
    public async Task<IActionResult> Update(Guid id, UpdateDonorCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{donorId:guid}/contacts")]
    [RequirePermission("donors.donors.update")]
    public async Task<IActionResult> AddContact(Guid donorId, AddDonorContactCommand command)
    {
        if (donorId != command.DonorId) return BadRequest();
        var id = await _sender.Send(command);
        return Created($"api/v1/donors/{donorId}/contacts/{id}", new { id });
    }
}
