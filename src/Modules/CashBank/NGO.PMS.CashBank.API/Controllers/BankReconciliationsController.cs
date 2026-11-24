using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.CashBank.Application.Commands.Reconciliations;
using NGO.PMS.CashBank.Application.Queries;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.CashBank.API.Controllers;

[ApiController]
[Route("api/v1/cash-bank/reconciliations")]
[Authorize]
public class BankReconciliationsController : ControllerBase
{
    private readonly ISender _sender;
    public BankReconciliationsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("cashbank.reconciliations.read")]
    public async Task<IActionResult> List([FromQuery] Guid? bankAccountId = null)
        => Ok(await _sender.Send(new ListBankReconciliationsQuery(bankAccountId)));

    [HttpPost]
    [RequirePermission("cashbank.reconciliations.create")]
    public async Task<IActionResult> Start(StartBankReconciliationCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/cash-bank/reconciliations/{id}", new { id });
    }

    [HttpPost("{id:guid}/complete")]
    [RequirePermission("cashbank.reconciliations.update")]
    public async Task<IActionResult> Complete(Guid id, CompleteBankReconciliationCommand command)
    {
        if (id != command.ReconciliationId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
