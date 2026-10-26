using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Participants.Application.Graduation.Commands.CreateBenchmark;
using NGO.PMS.Participants.Application.Graduation.Commands.UpdateBenchmark;
using NGO.PMS.Participants.Application.Graduation.Queries.ListBenchmarks;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Participants.API.Controllers;

[ApiController]
[Route("api/v1/graduation-criteria")]
[Authorize]
public class GraduationBenchmarksController : ControllerBase
{
    private readonly ISender _sender;
    public GraduationBenchmarksController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("graduation.tracking.manage")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? projectId,
        [FromQuery] bool? activeOnly)
        => Ok(await _sender.Send(new ListBenchmarksQuery(projectId, activeOnly)));

    [HttpPost]
    [RequirePermission("graduation.tracking.manage")]
    public async Task<IActionResult> Create(CreateBenchmarkCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/graduation-criteria/{id}", new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("graduation.tracking.manage")]
    public async Task<IActionResult> Update(Guid id, UpdateBenchmarkCommand command)
    {
        if (id != command.BenchmarkId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }
}
