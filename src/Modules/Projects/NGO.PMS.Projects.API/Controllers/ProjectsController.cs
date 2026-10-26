using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.Projects.Application.Projects.Commands.AddTeamMember;
using NGO.PMS.Projects.Application.Projects.Commands.ApproveProject;
using NGO.PMS.Projects.Application.Projects.Commands.CreateProject;
using NGO.PMS.Projects.Application.Projects.Commands.RejectProject;
using NGO.PMS.Projects.Application.Projects.Commands.RemoveTeamMember;
using NGO.PMS.Projects.Application.Projects.Commands.SubmitProject;
using NGO.PMS.Projects.Application.Projects.Commands.UpdateProject;
using NGO.PMS.Projects.Application.Projects.Queries.GetProject;
using NGO.PMS.Projects.Application.Projects.Queries.ListProjects;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Projects.API.Controllers;

[ApiController]
[Route("api/v1/projects")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly ISender _sender;
    public ProjectsController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("projects.projects.read")]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null, [FromQuery] string? status = null)
        => Ok(await _sender.Send(new ListProjectsQuery(page, pageSize, search, status)));

    [HttpGet("{id:guid}")]
    [RequirePermission("projects.projects.read")]
    public async Task<IActionResult> Get(Guid id)
        => Ok(await _sender.Send(new GetProjectQuery(id)));

    [HttpPost]
    [RequirePermission("projects.projects.create")]
    public async Task<IActionResult> Create(CreateProjectCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("projects.projects.update")]
    public async Task<IActionResult> Update(Guid id, UpdateProjectCommand command)
    {
        if (id != command.ProjectId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id:guid}/submit")]
    [RequirePermission("projects.projects.submit")]
    public async Task<IActionResult> Submit(Guid id)
    {
        await _sender.Send(new SubmitProjectCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/approve")]
    [RequirePermission("projects.projects.approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _sender.Send(new ApproveProjectCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/reject")]
    [RequirePermission("projects.projects.approve")]
    public async Task<IActionResult> Reject(Guid id, RejectProjectCommand command)
    {
        if (id != command.ProjectId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id:guid}/team")]
    [RequirePermission("projects.projects.manage")]
    public async Task<IActionResult> AddTeamMember(Guid id, AddTeamMemberCommand command)
    {
        if (id != command.ProjectId) return BadRequest();
        var memberId = await _sender.Send(command);
        return Created($"api/v1/projects/{id}/team/{memberId}", new { id = memberId });
    }

    [HttpDelete("{id:guid}/team/{memberId:guid}")]
    [RequirePermission("projects.projects.manage")]
    public async Task<IActionResult> RemoveTeamMember(Guid id, Guid memberId)
    {
        await _sender.Send(new RemoveTeamMemberCommand(id, memberId));
        return NoContent();
    }
}
