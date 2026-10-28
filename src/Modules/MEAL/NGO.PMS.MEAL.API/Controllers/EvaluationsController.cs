using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.MEAL.Application.Evaluations.Commands.AddFinding;
using NGO.PMS.MEAL.Application.Evaluations.Commands.CompleteEvaluation;
using NGO.PMS.MEAL.Application.Evaluations.Commands.CreateEvaluation;
using NGO.PMS.MEAL.Application.Evaluations.Commands.RespondToFinding;
using NGO.PMS.MEAL.Application.Evaluations.Commands.VerifyFinding;
using NGO.PMS.MEAL.Application.Evaluations.Queries.GetEvaluation;
using NGO.PMS.MEAL.Application.Evaluations.Queries.ListEvaluations;
using NGO.PMS.MEAL.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.MEAL.API.Controllers;

[ApiController]
[Route("api/v1/evaluations")]
[Authorize]
public class EvaluationsController : ControllerBase
{
    private readonly ISender _sender;
    public EvaluationsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("meal.evaluations.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? projectId,
        [FromQuery] EvaluationStatus? status)
        => Ok(await _sender.Send(new ListEvaluationsQuery(projectId, status)));

    [HttpGet("{id:guid}")]
    [RequirePermission("meal.evaluations.read")]
    public async Task<IActionResult> Get(Guid id)
        => Ok(await _sender.Send(new GetEvaluationQuery(id)));

    [HttpPost]
    [RequirePermission("meal.evaluations.create")]
    public async Task<IActionResult> Create(CreateEvaluationCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPost("{id:guid}/complete")]
    [RequirePermission("meal.evaluations.create")]
    public async Task<IActionResult> Complete(Guid id, CompleteEvaluationCommand command)
    {
        if (id != command.EvaluationId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    // ── Findings ────────────────────────────────────────

    [HttpPost("{id:guid}/findings")]
    [RequirePermission("meal.evaluations.create")]
    public async Task<IActionResult> AddFinding(Guid id, AddFindingCommand command)
    {
        if (id != command.EvaluationId) return BadRequest();
        var findingId = await _sender.Send(command);
        return Created($"api/v1/evaluations/{id}/findings/{findingId}", new { id = findingId });
    }

    [HttpPost("findings/{findingId:guid}/respond")]
    [RequirePermission("meal.evaluations.create")]
    public async Task<IActionResult> RespondToFinding(Guid findingId, RespondToFindingCommand command)
    {
        if (findingId != command.FindingId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("findings/{findingId:guid}/verify")]
    [RequirePermission("meal.evaluations.create")]
    public async Task<IActionResult> VerifyFinding(Guid findingId, VerifyFindingCommand command)
    {
        if (findingId != command.FindingId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
