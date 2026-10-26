using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Training.Application.Commands.CreateTrainingProgram;
using NGO.PMS.Training.Application.Commands.UpdateTrainingProgram;
using NGO.PMS.Training.Application.Queries.ListTrainingPrograms;
using NGO.PMS.Training.Domain.Enums;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Training.API.Controllers;

[ApiController]
[Route("api/v1/training-programs")]
[Authorize]
public class TrainingProgramsController : ControllerBase
{
    private readonly ISender _sender;
    public TrainingProgramsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("training.programs.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? projectId,
        [FromQuery] TrainingCategory? category,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
        => Ok(await _sender.Send(new ListTrainingProgramsQuery(projectId, category, page, pageSize)));

    [HttpPost]
    [RequirePermission("training.programs.create")]
    public async Task<IActionResult> Create(CreateTrainingProgramCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/training-programs/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("training.programs.update")]
    public async Task<IActionResult> Update(Guid id, UpdateTrainingProgramCommand command)
    {
        if (id != command.ProgramId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
