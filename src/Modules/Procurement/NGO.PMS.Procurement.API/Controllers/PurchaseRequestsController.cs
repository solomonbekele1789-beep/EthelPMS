using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Procurement.Application.Commands.PurchaseRequests.AddPurchaseRequestItem;
using NGO.PMS.Procurement.Application.Commands.PurchaseRequests.ApprovePurchaseRequest;
using NGO.PMS.Procurement.Application.Commands.PurchaseRequests.CreatePurchaseRequest;
using NGO.PMS.Procurement.Application.Commands.PurchaseRequests.SubmitPurchaseRequest;
using NGO.PMS.Procurement.Application.Queries.ListPurchaseRequests;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Procurement.API.Controllers;

[ApiController]
[Route("api/v1/purchase-requests")]
[Authorize]
public class PurchaseRequestsController : ControllerBase
{
    private readonly ISender _sender;
    public PurchaseRequestsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("procurement.requests.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? projectId,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        return Ok(await _sender.Send(new ListPurchaseRequestsQuery(projectId, status, page, pageSize)));
    }

    [HttpPost]
    [RequirePermission("procurement.requests.create")]
    public async Task<IActionResult> Create(CreatePurchaseRequestCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/purchase-requests/{id}", new { id });
    }

    [HttpPost("{id:guid}/items")]
    [RequirePermission("procurement.requests.update")]
    public async Task<IActionResult> AddItem(Guid id, AddPurchaseRequestItemCommand command)
    {
        if (id != command.RequestId) return BadRequest();
        var itemId = await _sender.Send(command);
        return Created($"api/v1/purchase-requests/{id}/items/{itemId}", new { id = itemId });
    }

    [HttpPut("{id:guid}/submit")]
    [RequirePermission("procurement.requests.update")]
    public async Task<IActionResult> Submit(Guid id)
    {
        await _sender.Send(new SubmitPurchaseRequestCommand(id));
        return NoContent();
    }

    [HttpPut("{id:guid}/approve")]
    [RequirePermission("procurement.requests.approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _sender.Send(new ApprovePurchaseRequestCommand(id));
        return NoContent();
    }
}
