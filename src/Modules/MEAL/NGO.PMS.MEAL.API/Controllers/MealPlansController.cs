using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.MEAL.Application.MealPlans.Commands.AddMealIndicator;
using NGO.PMS.MEAL.Application.MealPlans.Commands.ApproveMealPlan;
using NGO.PMS.MEAL.Application.MealPlans.Commands.CreateMealPlan;
using NGO.PMS.MEAL.Application.MealPlans.Commands.RecordMeasurement;
using NGO.PMS.MEAL.Application.MealPlans.Commands.RejectMealPlan;
using NGO.PMS.MEAL.Application.MealPlans.Commands.SubmitMealPlan;
using NGO.PMS.MEAL.Application.MealPlans.Commands.UpdateMealPlan;
using NGO.PMS.MEAL.Application.MealPlans.Commands.UpdateMealPlanSection;
using NGO.PMS.MEAL.Application.MealPlans.Queries.GetMealPlan;
using NGO.PMS.MEAL.Application.MealPlans.Queries.ListMealPlans;
using NGO.PMS.MEAL.Application.MealPlans.Queries.ListMeasurements;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.MEAL.API.Controllers;

[ApiController]
[Route("api/v1/meal-plans")]
[Authorize]
public class MealPlansController : ControllerBase
{
    private readonly ISender _sender;
    public MealPlansController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("meal.plans.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? projectId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _sender.Send(new ListMealPlansQuery(projectId, page, pageSize)));

    [HttpGet("{id:guid}")]
    [RequirePermission("meal.plans.read")]
    public async Task<IActionResult> Get(Guid id)
        => Ok(await _sender.Send(new GetMealPlanQuery(id)));

    [HttpPost]
    [RequirePermission("meal.plans.create")]
    public async Task<IActionResult> Create(CreateMealPlanCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("meal.plans.update")]
    public async Task<IActionResult> Update(Guid id, UpdateMealPlanCommand command)
    {
        if (id != command.MealPlanId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{id:guid}/sections/{sectionNumber:int}")]
    [RequirePermission("meal.plans.update")]
    public async Task<IActionResult> UpdateSection(Guid id, int sectionNumber, [FromBody] UpdateMealPlanSectionBody body)
    {
        await _sender.Send(new UpdateMealPlanSectionCommand(id, sectionNumber, body.Content));
        return NoContent();
    }

    [HttpPost("{id:guid}/submit")]
    [RequirePermission("meal.plans.update")]
    public async Task<IActionResult> Submit(Guid id)
    {
        await _sender.Send(new SubmitMealPlanCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/approve")]
    [RequirePermission("meal.plans.update")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _sender.Send(new ApproveMealPlanCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/reject")]
    [RequirePermission("meal.plans.update")]
    public async Task<IActionResult> Reject(Guid id, RejectMealPlanCommand command)
    {
        if (id != command.MealPlanId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    // ── Indicators ──────────────────────────────────────

    [HttpPost("{id:guid}/indicators")]
    [RequirePermission("meal.plans.update")]
    public async Task<IActionResult> AddIndicator(Guid id, AddMealIndicatorCommand command)
    {
        if (id != command.MealPlanId) return BadRequest();
        var indicatorId = await _sender.Send(command);
        return Created($"api/v1/meal-plans/{id}/indicators/{indicatorId}", new { id = indicatorId });
    }

    // ── Measurements ────────────────────────────────────

    [HttpPost("indicators/{indicatorId:guid}/measurements")]
    [RequirePermission("meal.plans.update")]
    public async Task<IActionResult> RecordMeasurement(Guid indicatorId, RecordMeasurementCommand command)
    {
        if (indicatorId != command.MealIndicatorId) return BadRequest();
        var measurementId = await _sender.Send(command);
        return Created($"api/v1/meal-plans/indicators/{indicatorId}/measurements/{measurementId}", new { id = measurementId });
    }

    [HttpGet("indicators/{indicatorId:guid}/measurements")]
    [RequirePermission("meal.plans.read")]
    public async Task<IActionResult> ListMeasurements(Guid indicatorId)
        => Ok(await _sender.Send(new ListMeasurementsQuery(indicatorId)));
}

public record UpdateMealPlanSectionBody(string? Content);
