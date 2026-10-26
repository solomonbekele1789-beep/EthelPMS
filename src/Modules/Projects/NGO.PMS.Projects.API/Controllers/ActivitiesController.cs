using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateActivity;
using NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateActivity;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Projects.API.Controllers;

[ApiController]
[Route("api/v1/outputs/{outputId:guid}/activities")]
[Authorize]
public class ActivitiesController : ControllerBase
{
    private readonly ISender _sender;
    public ActivitiesController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("projects.activities.create")]
    public async Task<IActionResult> Create(Guid outputId, CreateActivityCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/outputs/{outputId}/activities/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("projects.activities.update")]
    public async Task<IActionResult> Update(Guid id, UpdateActivityCommand command)
    {
        if (id != command.ActivityId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
