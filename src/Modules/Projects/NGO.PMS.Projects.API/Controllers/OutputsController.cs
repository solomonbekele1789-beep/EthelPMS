using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateOutput;
using NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateOutput;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Projects.API.Controllers;

[ApiController]
[Route("api/v1/outcomes/{outcomeId:guid}/outputs")]
[Authorize]
public class OutputsController : ControllerBase
{
    private readonly ISender _sender;
    public OutputsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("projects.outputs.create")]
    public async Task<IActionResult> Create(Guid outcomeId, CreateOutputCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/outcomes/{outcomeId}/outputs/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("projects.outputs.update")]
    public async Task<IActionResult> Update(Guid id, UpdateOutputCommand command)
    {
        if (id != command.OutputId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
