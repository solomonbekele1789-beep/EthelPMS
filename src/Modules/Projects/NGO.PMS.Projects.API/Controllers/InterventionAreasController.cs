using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Projects.Application.InterventionAreas.Commands.AllocateInterventionArea;
using NGO.PMS.Projects.Application.InterventionAreas.Commands.CreateInterventionArea;
using NGO.PMS.Projects.Application.InterventionAreas.Commands.DeallocateInterventionArea;
using NGO.PMS.Projects.Application.InterventionAreas.Commands.DeleteInterventionArea;
using NGO.PMS.Projects.Application.InterventionAreas.Commands.UpdateInterventionArea;
using NGO.PMS.Projects.Application.InterventionAreas.Queries.ListInterventionAreas;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Projects.API.Controllers;

[ApiController]
[Route("api/v1/intervention-areas")]
[Authorize]
public class InterventionAreasController : ControllerBase
{
    private readonly ISender _sender;
    public InterventionAreasController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("projects.interventionareas.read")]
    public async Task<IActionResult> List([FromQuery] bool flat = false)
        => Ok(await _sender.Send(new ListInterventionAreasQuery(flat)));

    [HttpPost]
    [RequirePermission("projects.interventionareas.create")]
    public async Task<IActionResult> Create(CreateInterventionAreaCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/intervention-areas/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("projects.interventionareas.update")]
    public async Task<IActionResult> Update(Guid id, UpdateInterventionAreaCommand command)
    {
        if (id != command.InterventionAreaId)
            command = command with { InterventionAreaId = id };
        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("projects.interventionareas.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteInterventionAreaCommand(id));
        return NoContent();
    }

    [HttpPost("allocate")]
    [RequirePermission("projects.interventionareas.manage")]
    public async Task<IActionResult> Allocate(AllocateInterventionAreaCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/intervention-areas/allocations/{id}", new { id });
    }

    [HttpDelete("allocations/{id:guid}")]
    [RequirePermission("projects.interventionareas.manage")]
    public async Task<IActionResult> Deallocate(Guid id, [FromQuery] Guid projectId)
    {
        await _sender.Send(new DeallocateInterventionAreaCommand(projectId, id));
        return NoContent();
    }
}
