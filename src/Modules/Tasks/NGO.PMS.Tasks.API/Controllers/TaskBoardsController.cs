using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.SharedKernel.Authorization;
using NGO.PMS.Tasks.Application.Commands.TaskBoards.CreateTaskBoard;
using NGO.PMS.Tasks.Application.Queries.GetTaskBoard;

namespace NGO.PMS.Tasks.API.Controllers;

[ApiController]
[Route("api/v1/task-boards")]
[Authorize]
public class TaskBoardsController : ControllerBase
{
    private readonly ISender _sender;

    public TaskBoardsController(ISender sender) => _sender = sender;

    [HttpGet("{id:guid}")]
    [RequirePermission("tasks.boards.read")]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _sender.Send(new GetTaskBoardQuery(id));
        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("tasks.boards.create")]
    public async Task<IActionResult> Create(CreateTaskBoardCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }
}
