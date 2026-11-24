using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.CashBank.Application.Commands.PettyCash;
using NGO.PMS.CashBank.Application.Queries;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.CashBank.API.Controllers;

[ApiController]
[Route("api/v1/cash-bank/petty-cash")]
[Authorize]
public class PettyCashController : ControllerBase
{
    private readonly ISender _sender;
    public PettyCashController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("cashbank.pettycash.read")]
    public async Task<IActionResult> List([FromQuery] bool? isActive = null)
        => Ok(await _sender.Send(new ListPettyCashFundsQuery(isActive)));

    [HttpPost]
    [RequirePermission("cashbank.pettycash.create")]
    public async Task<IActionResult> Create(CreatePettyCashFundCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/cash-bank/petty-cash/{id}", new { id });
    }

    [HttpPost("{id:guid}/replenish")]
    [RequirePermission("cashbank.pettycash.update")]
    public async Task<IActionResult> Replenish(Guid id, ReplenishPettyCashCommand command)
    {
        if (id != command.FundId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
