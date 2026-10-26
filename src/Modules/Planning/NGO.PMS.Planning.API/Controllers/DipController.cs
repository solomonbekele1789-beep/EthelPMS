using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Planning.Application.Dip.Commands.CreateDipItem;
using NGO.PMS.Planning.Application.Dip.Commands.CreateDipMilestone;
using NGO.PMS.Planning.Application.Dip.Commands.UpdateDipItem;
using NGO.PMS.Planning.Application.Dip.Queries.ListDipItems;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Planning.API.Controllers;

[ApiController]
[Route("api/v1/activities/{activityId:guid}/dips")]
[Authorize]
public class DipController : ControllerBase
{
    private readonly ISender _sender;
    public DipController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("dip.entries.read")]
    public async Task<IActionResult> List(Guid activityId)
        => Ok(await _sender.Send(new ListDipItemsQuery(activityId)));

    [HttpPost]
    [RequirePermission("dip.entries.create")]
    public async Task<IActionResult> Create(Guid activityId, CreateDipItemCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/activities/{activityId}/dips/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("dip.entries.update")]
    public async Task<IActionResult> Update(Guid id, UpdateDipItemCommand command)
    {
        if (id != command.DipItemId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id:guid}/milestones")]
    [RequirePermission("dip.entries.update")]
    public async Task<IActionResult> AddMilestone(Guid id, CreateDipMilestoneCommand command)
    {
        if (id != command.DipItemId) return BadRequest();
        var milestoneId = await _sender.Send(command);
        return Created($"api/v1/activities/{id}/dips/{id}/milestones/{milestoneId}", new { id = milestoneId });
    }
}
