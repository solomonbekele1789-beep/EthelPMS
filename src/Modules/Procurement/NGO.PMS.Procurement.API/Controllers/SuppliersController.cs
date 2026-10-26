using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Procurement.Application.Commands.Suppliers.BlacklistSupplier;
using NGO.PMS.Procurement.Application.Commands.Suppliers.CreateSupplier;
using NGO.PMS.Procurement.Application.Commands.Suppliers.RateSupplier;
using NGO.PMS.Procurement.Application.Commands.Suppliers.UpdateSupplier;
using NGO.PMS.Procurement.Application.Queries.GetSupplier;
using NGO.PMS.Procurement.Application.Queries.ListSuppliers;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Procurement.API.Controllers;

[ApiController]
[Route("api/v1/suppliers")]
[Authorize]
public class SuppliersController : ControllerBase
{
    private readonly ISender _sender;
    public SuppliersController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("procurement.suppliers.read")]
    public async Task<IActionResult> List([FromQuery] string? status, [FromQuery] string? search)
    {
        return Ok(await _sender.Send(new ListSuppliersQuery(status, search)));
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("procurement.suppliers.read")]
    public async Task<IActionResult> Get(Guid id)
    {
        return Ok(await _sender.Send(new GetSupplierQuery(id)));
    }

    [HttpPost]
    [RequirePermission("procurement.suppliers.create")]
    public async Task<IActionResult> Create(CreateSupplierCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("procurement.suppliers.update")]
    public async Task<IActionResult> Update(Guid id, UpdateSupplierCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{id:guid}/rate")]
    [RequirePermission("procurement.suppliers.update")]
    public async Task<IActionResult> Rate(Guid id, [FromQuery] int score)
    {
        await _sender.Send(new RateSupplierCommand(id, score));
        return NoContent();
    }

    [HttpPut("{id:guid}/blacklist")]
    [RequirePermission("procurement.suppliers.update")]
    public async Task<IActionResult> Blacklist(Guid id, [FromBody] string reason)
    {
        await _sender.Send(new BlacklistSupplierCommand(id, reason));
        return NoContent();
    }
}
