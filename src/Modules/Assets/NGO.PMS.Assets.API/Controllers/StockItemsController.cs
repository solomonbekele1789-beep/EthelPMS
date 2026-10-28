using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Assets.Application.Commands.StockItems.CreateStockItem;
using NGO.PMS.Assets.Application.Commands.StockItems.RecordStockMovement;
using NGO.PMS.Assets.Application.Queries.ListStockItems;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Assets.API.Controllers;

[ApiController]
[Route("api/v1/stock-items")]
[Authorize]
public class StockItemsController : ControllerBase
{
    private readonly ISender _sender;
    public StockItemsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("assets.stock.read")]
    public async Task<IActionResult> List(
        [FromQuery] string? category,
        [FromQuery] string? search)
        => Ok(await _sender.Send(new ListStockItemsQuery(category, search)));

    [HttpPost]
    [RequirePermission("assets.stock.create")]
    public async Task<IActionResult> Create(CreateStockItemCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/stock-items/{id}", new { id });
    }

    [HttpPost("{id:guid}/movements")]
    [RequirePermission("assets.stock.issue")]
    public async Task<IActionResult> RecordMovement(Guid id, RecordStockMovementCommand command)
    {
        if (id != command.StockItemId) return BadRequest();
        var movementId = await _sender.Send(command);
        return Created($"api/v1/stock-items/{id}/movements/{movementId}", new { id = movementId });
    }
}
