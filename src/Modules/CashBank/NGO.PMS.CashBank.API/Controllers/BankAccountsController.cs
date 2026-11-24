using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.CashBank.Application.Commands.BankAccounts;
using NGO.PMS.CashBank.Application.Queries;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.CashBank.API.Controllers;

[ApiController]
[Route("api/v1/cash-bank/accounts")]
[Authorize]
public class BankAccountsController : ControllerBase
{
    private readonly ISender _sender;
    public BankAccountsController(ISender sender) => _sender = sender;

    [HttpGet("summary")]
    [RequirePermission("cashbank.accounts.read")]
    public async Task<IActionResult> Summary()
        => Ok(await _sender.Send(new GetCashBankSummaryQuery()));

    [HttpGet]
    [RequirePermission("cashbank.accounts.read")]
    public async Task<IActionResult> List([FromQuery] bool? isActive = null, [FromQuery] string? currencyCode = null)
        => Ok(await _sender.Send(new ListBankAccountsQuery(isActive, currencyCode)));

    [HttpPost]
    [RequirePermission("cashbank.accounts.create")]
    public async Task<IActionResult> Create(CreateBankAccountCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/cash-bank/accounts/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("cashbank.accounts.update")]
    public async Task<IActionResult> Update(Guid id, UpdateBankAccountCommand command)
    {
        if (id != command.Id) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
