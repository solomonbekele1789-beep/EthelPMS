using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.FundAccounting.Application.Commands.Budgets.AddBudgetLine;
using NGO.PMS.FundAccounting.Application.Commands.Budgets.ApproveBudget;
using NGO.PMS.FundAccounting.Application.Commands.Budgets.CreateBudget;
using NGO.PMS.FundAccounting.Application.Commands.Budgets.SubmitBudget;
using NGO.PMS.FundAccounting.Application.Queries.GetBudget;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.FundAccounting.API.Controllers;

[ApiController]
[Route("api/v1/budgets")]
[Authorize]
public class BudgetsController : ControllerBase
{
    private readonly ISender _sender;
    public BudgetsController(ISender sender) => _sender = sender;

    [HttpGet("{id:guid}")]
    [RequirePermission("fundacct.budgets.read")]
    public async Task<IActionResult> Get(Guid id)
        => Ok(await _sender.Send(new GetBudgetQuery(id)));

    [HttpPost]
    [RequirePermission("fundacct.budgets.create")]
    public async Task<IActionResult> Create(CreateBudgetCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPost("{id:guid}/lines")]
    [RequirePermission("fundacct.budgets.update")]
    public async Task<IActionResult> AddLine(Guid id, AddBudgetLineCommand command)
    {
        if (id != command.BudgetId) return BadRequest();
        var lineId = await _sender.Send(command);
        return Created($"api/v1/budgets/{id}/lines/{lineId}", new { id = lineId });
    }

    [HttpPut("{id:guid}/submit")]
    [RequirePermission("fundacct.budgets.update")]
    public async Task<IActionResult> Submit(Guid id)
    {
        await _sender.Send(new SubmitBudgetCommand(id));
        return NoContent();
    }

    [HttpPut("{id:guid}/approve")]
    [RequirePermission("fundacct.budgets.approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _sender.Send(new ApproveBudgetCommand(id));
        return NoContent();
    }
}
