using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Procurement.Application.Commands.PurchaseOrders.CreatePurchaseOrder;
using NGO.PMS.Procurement.Application.Commands.PurchaseOrders.IssuePurchaseOrder;
using NGO.PMS.Procurement.Application.Queries.GetPurchaseOrder;
using NGO.PMS.Procurement.Application.Queries.ListPurchaseOrders;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Procurement.API.Controllers;

[ApiController]
[Route("api/v1/purchase-orders")]
[Authorize]
public class PurchaseOrdersController : ControllerBase
{
    private readonly ISender _sender;
    public PurchaseOrdersController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("procurement.orders.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? supplierId,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        return Ok(await _sender.Send(new ListPurchaseOrdersQuery(supplierId, status, page, pageSize)));
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("procurement.orders.read")]
    public async Task<IActionResult> Get(Guid id)
    {
        return Ok(await _sender.Send(new GetPurchaseOrderQuery(id)));
    }

    [HttpPost]
    [RequirePermission("procurement.orders.create")]
    public async Task<IActionResult> Create(CreatePurchaseOrderCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}/issue")]
    [RequirePermission("procurement.orders.issue")]
    public async Task<IActionResult> Issue(Guid id)
    {
        await _sender.Send(new IssuePurchaseOrderCommand(id));
        return NoContent();
    }
}
