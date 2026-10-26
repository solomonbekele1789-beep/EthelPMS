using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Participants.Application.Graduation.Commands.ApproveGraduation;
using NGO.PMS.Participants.Application.Graduation.Commands.CreateGraduationDecision;
using NGO.PMS.Participants.Application.Graduation.Commands.RecordAssessment;
using NGO.PMS.Participants.Application.Graduation.Commands.RejectGraduation;
using NGO.PMS.Participants.Application.Graduation.Queries.GetGraduationPipeline;
using NGO.PMS.Participants.Application.Graduation.Queries.ListAssessments;
using NGO.PMS.Participants.Application.Graduation.Queries.ListDecisions;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Participants.API.Controllers;

[ApiController]
[Route("api/v1/graduation-tracking")]
[Authorize]
public class GraduationTrackingController : ControllerBase
{
    private readonly ISender _sender;
    public GraduationTrackingController(ISender sender) => _sender = sender;

    // ── Pipeline ────────────────────────────────────────

    [HttpGet("pipeline/{projectId:guid}")]
    [RequirePermission("graduation.tracking.manage")]
    public async Task<IActionResult> GetPipeline(Guid projectId)
        => Ok(await _sender.Send(new GetGraduationPipelineQuery(projectId)));

    // ── Assessments ─────────────────────────────────────

    [HttpPost("assessments")]
    [RequirePermission("graduation.tracking.manage")]
    public async Task<IActionResult> RecordAssessment(RecordAssessmentCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/graduation-tracking/assessments/{id}", new { id });
    }

    [HttpGet("assessments/{participantId:guid}")]
    [RequirePermission("graduation.tracking.manage")]
    public async Task<IActionResult> ListAssessments(
        Guid participantId,
        [FromQuery] Guid? benchmarkId)
        => Ok(await _sender.Send(new ListAssessmentsQuery(participantId, benchmarkId)));

    // ── Decisions ────────────────────────────────────────

    [HttpGet("decisions")]
    [RequirePermission("graduation.tracking.manage")]
    public async Task<IActionResult> ListDecisions(
        [FromQuery] Guid? projectId,
        [FromQuery] Guid? participantId)
        => Ok(await _sender.Send(new ListDecisionsQuery(projectId, participantId)));

    [HttpPost("decisions")]
    [RequirePermission("graduation.tracking.manage")]
    public async Task<IActionResult> CreateDecision(CreateGraduationDecisionCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/graduation-tracking/decisions/{id}", new { id });
    }

    [HttpPost("decisions/{id:guid}/approve")]
    [RequirePermission("graduation.tracking.approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _sender.Send(new ApproveGraduationCommand(id));
        return NoContent();
    }

    [HttpPost("decisions/{id:guid}/reject")]
    [RequirePermission("graduation.tracking.approve")]
    public async Task<IActionResult> Reject(Guid id, RejectGraduationCommand command)
    {
        if (id != command.DecisionId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
