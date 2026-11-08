using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateOutcome;
using NGO.PMS.Projects.Application.ResultsFramework.Commands.DeleteOutcome;
using NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateOutcome;
using NGO.PMS.Projects.Application.ResultsFramework.Queries.ListOutcomes;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Projects.API.Controllers;

[ApiController]
[Route("api/v1/projects/{projectId:guid}/outcomes")]
[Authorize]
public class OutcomesController : ControllerBase
{
    private readonly ISender _sender;
    public OutcomesController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("projects.outcomes.read")]
    public async Task<IActionResult> List(Guid projectId)
        => Ok(await _sender.Send(new ListOutcomesQuery(projectId)));

    [HttpPost]
    [RequirePermission("projects.outcomes.create")]
    public async Task<IActionResult> Create(Guid projectId, CreateOutcomeCommand command)
    {
        var id = await _sender.Send(command with { ProjectId = projectId });
        return Created($"api/v1/projects/{projectId}/outcomes/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("projects.outcomes.update")]
    public async Task<IActionResult> Update(Guid id, UpdateOutcomeCommand command)
    {
        if (id != command.OutcomeId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("projects.outcomes.update")]
    public async Task<IActionResult> Delete(Guid projectId, Guid id)
    {
        await _sender.Send(new DeleteOutcomeCommand(id));
        return NoContent();
    }
}
