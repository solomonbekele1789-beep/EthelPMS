using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Procurement.Application.Commands.ProcurementPlans.AddPlanItem;
using NGO.PMS.Procurement.Application.Commands.ProcurementPlans.ApproveProcurementPlan;
using NGO.PMS.Procurement.Application.Commands.ProcurementPlans.CreateProcurementPlan;
using NGO.PMS.Procurement.Application.Commands.ProcurementPlans.SubmitProcurementPlan;
using NGO.PMS.Procurement.Application.Queries.GetProcurementPlan;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Procurement.API.Controllers;

[ApiController]
[Route("api/v1/procurement-plans")]
[Authorize]
public class ProcurementPlansController : ControllerBase
{
    private readonly ISender _sender;
    public ProcurementPlansController(ISender sender) => _sender = sender;

    [HttpGet("{id:guid}")]
    [RequirePermission("procurement.plans.read")]
    public async Task<IActionResult> Get(Guid id)
    {
        return Ok(await _sender.Send(new GetProcurementPlanQuery(id)));
    }

    [HttpPost]
    [RequirePermission("procurement.plans.create")]
    public async Task<IActionResult> Create(CreateProcurementPlanCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPost("{id:guid}/items")]
    [RequirePermission("procurement.plans.update")]
    public async Task<IActionResult> AddItem(Guid id, AddPlanItemCommand command)
    {
        if (id != command.PlanId) return BadRequest();
        var itemId = await _sender.Send(command);
        return Created($"api/v1/procurement-plans/{id}/items/{itemId}", new { id = itemId });
    }

    [HttpPut("{id:guid}/submit")]
    [RequirePermission("procurement.plans.update")]
    public async Task<IActionResult> Submit(Guid id)
    {
        await _sender.Send(new SubmitProcurementPlanCommand(id));
        return NoContent();
    }

    [HttpPut("{id:guid}/approve")]
    [RequirePermission("procurement.plans.approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _sender.Send(new ApproveProcurementPlanCommand(id));
        return NoContent();
    }
}
