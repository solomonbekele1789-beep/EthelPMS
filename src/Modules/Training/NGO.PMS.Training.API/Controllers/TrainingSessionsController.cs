using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Training.Application.Commands.CompleteTrainingSession;
using NGO.PMS.Training.Application.Commands.CreateTrainingSession;
using NGO.PMS.Training.Application.Commands.RecordAttendance;
using NGO.PMS.Training.Application.Commands.RegisterParticipant;
using NGO.PMS.Training.Application.Queries.GetTrainingSession;
using NGO.PMS.Training.Application.Queries.ListTrainingSessions;
using NGO.PMS.Training.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Training.API.Controllers;

[ApiController]
[Route("api/v1/training-sessions")]
[Authorize]
public class TrainingSessionsController : ControllerBase
{
    private readonly ISender _sender;
    public TrainingSessionsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("training.sessions.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? programId,
        [FromQuery] TrainingStatus? status,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _sender.Send(new ListTrainingSessionsQuery(programId, status, fromDate, toDate, page, pageSize)));

    [HttpGet("{id:guid}")]
    [RequirePermission("training.sessions.read")]
    public async Task<IActionResult> Get(Guid id)
        => Ok(await _sender.Send(new GetTrainingSessionQuery(id)));

    [HttpPost]
    [RequirePermission("training.sessions.create")]
    public async Task<IActionResult> Create(CreateTrainingSessionCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPost("{id:guid}/complete")]
    [RequirePermission("training.sessions.update")]
    public async Task<IActionResult> Complete(Guid id)
    {
        await _sender.Send(new CompleteTrainingSessionCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/participants")]
    [RequirePermission("training.sessions.update")]
    public async Task<IActionResult> RegisterParticipant(Guid id, RegisterParticipantCommand command)
    {
        if (id != command.TrainingSessionId) return BadRequest();
        var participantId = await _sender.Send(command);
        return Created($"api/v1/training-sessions/{id}/participants/{participantId}", new { id = participantId });
    }

    [HttpPost("participants/{participantId:guid}/attendance")]
    [RequirePermission("training.sessions.update")]
    public async Task<IActionResult> RecordAttendance(Guid participantId, RecordAttendanceCommand command)
    {
        if (participantId != command.TrainingParticipantId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
