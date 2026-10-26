using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Procurement.Application.Commands.GoodsReceipts.ConfirmGoodsReceipt;
using NGO.PMS.Procurement.Application.Commands.GoodsReceipts.CreateGoodsReceivedNote;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Procurement.API.Controllers;

[ApiController]
[Route("api/v1/goods-receipts")]
[Authorize]
public class GoodsReceiptsController : ControllerBase
{
    private readonly ISender _sender;
    public GoodsReceiptsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("procurement.receipts.create")]
    public async Task<IActionResult> Create(CreateGoodsReceivedNoteCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/goods-receipts/{id}", new { id });
    }

    [HttpPut("{id:guid}/confirm")]
    [RequirePermission("procurement.receipts.confirm")]
    public async Task<IActionResult> Confirm(Guid id)
    {
        await _sender.Send(new ConfirmGoodsReceiptCommand(id));
        return NoContent();
    }
}
