using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Planning.Application.Plans.Commands.ApprovePlan;
using NGO.PMS.Planning.Application.Plans.Commands.CreatePlanActivity;
using NGO.PMS.Planning.Application.Plans.Commands.CreatePlanEntry;
using NGO.PMS.Planning.Application.Plans.Commands.RejectPlan;
using NGO.PMS.Planning.Application.Plans.Commands.SubmitPlan;
using NGO.PMS.Planning.Application.Plans.Commands.UpdatePlanEntry;
using NGO.PMS.Planning.Application.Plans.Queries.GetPlanEntry;
using NGO.PMS.Planning.Application.Plans.Queries.GetPlanHierarchy;
using NGO.PMS.Planning.Application.Plans.Queries.ListPlanEntries;
using NGO.PMS.Planning.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Planning.API.Controllers;

[ApiController]
[Route("api/v1/plans")]
[Authorize]
public class PlansController : ControllerBase
{
    private readonly ISender _sender;
    public PlansController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("planning.annual.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? projectId = null,
        [FromQuery] PlanLevel? level = null,
        [FromQuery] Guid? parentId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _sender.Send(new ListPlanEntriesQuery(projectId, level, parentId, page, pageSize)));

    [HttpGet("{id:guid}")]
    [RequirePermission("planning.annual.read")]
    public async Task<IActionResult> Get(Guid id)
        => Ok(await _sender.Send(new GetPlanEntryQuery(id)));

    [HttpGet("hierarchy")]
    [RequirePermission("planning.annual.read")]
    public async Task<IActionResult> GetHierarchy([FromQuery] Guid projectId, [FromQuery] int? fiscalYear = null)
        => Ok(await _sender.Send(new GetPlanHierarchyQuery(projectId, fiscalYear)));

    [HttpPost]
    [RequirePermission("planning.annual.create")]
    public async Task<IActionResult> Create(CreatePlanEntryCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("planning.annual.update")]
    public async Task<IActionResult> Update(Guid id, UpdatePlanEntryCommand command)
    {
        if (id != command.PlanEntryId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id:guid}/submit")]
    [RequirePermission("planning.annual.update")]
    public async Task<IActionResult> Submit(Guid id)
    {
        await _sender.Send(new SubmitPlanCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/approve")]
    [RequirePermission("planning.annual.approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _sender.Send(new ApprovePlanCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/reject")]
    [RequirePermission("planning.annual.approve")]
    public async Task<IActionResult> Reject(Guid id, RejectPlanCommand command)
    {
        if (id != command.PlanEntryId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id:guid}/activities")]
    [RequirePermission("planning.annual.update")]
    public async Task<IActionResult> AddActivity(Guid id, CreatePlanActivityCommand command)
    {
        if (id != command.PlanEntryId) return BadRequest();
        var activityId = await _sender.Send(command);
        return Created($"api/v1/plans/{id}/activities/{activityId}", new { id = activityId });
    }
}
