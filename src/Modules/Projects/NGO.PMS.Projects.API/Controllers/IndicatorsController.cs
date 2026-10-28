using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateIndicator;
using NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateIndicator;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Projects.API.Controllers;

[ApiController]
[Route("api/v1/projects/{projectId:guid}/indicators")]
[Authorize]
public class IndicatorsController : ControllerBase
{
    private readonly ISender _sender;
    public IndicatorsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("projects.indicators.create")]
    public async Task<IActionResult> Create(Guid projectId, CreateIndicatorCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/projects/{projectId}/indicators/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("projects.indicators.update")]
    public async Task<IActionResult> Update(Guid id, UpdateIndicatorCommand command)
    {
        if (id != command.IndicatorId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
