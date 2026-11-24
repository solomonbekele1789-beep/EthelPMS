using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.CashBank.Application.Commands.Transactions;
using NGO.PMS.CashBank.Application.Queries;
using NGO.PMS.CashBank.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.CashBank.API.Controllers;

[ApiController]
[Route("api/v1/cash-bank/transactions")]
[Authorize]
public class CashTransactionsController : ControllerBase
{
    private readonly ISender _sender;
    public CashTransactionsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("cashbank.transactions.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? bankAccountId = null,
        [FromQuery] CashTransactionStatus? status = null,
        [FromQuery] bool? isReconciled = null)
        => Ok(await _sender.Send(new ListCashTransactionsQuery(bankAccountId, status, isReconciled)));

    [HttpPost]
    [RequirePermission("cashbank.transactions.create")]
    public async Task<IActionResult> Create(CreateCashTransactionCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/cash-bank/transactions/{id}", new { id });
    }

    [HttpPost("{id:guid}/approve")]
    [RequirePermission("cashbank.transactions.approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _sender.Send(new ApproveCashTransactionCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/post")]
    [RequirePermission("cashbank.transactions.post")]
    public async Task<IActionResult> Post(Guid id)
    {
        await _sender.Send(new PostCashTransactionCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/void")]
    [RequirePermission("cashbank.transactions.void")]
    public async Task<IActionResult> Void(Guid id)
    {
        await _sender.Send(new VoidCashTransactionCommand(id));
        return NoContent();
    }
}
