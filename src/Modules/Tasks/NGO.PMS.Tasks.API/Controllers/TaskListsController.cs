using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.SharedKernel.Authorization;
using NGO.PMS.Tasks.Application.Commands.TaskLists.CreateTaskList;

namespace NGO.PMS.Tasks.API.Controllers;

[ApiController]
[Route("api/v1/task-lists")]
[Authorize]
public class TaskListsController : ControllerBase
{
    private readonly ISender _sender;

    public TaskListsController(ISender sender) => _sender = sender;

    [HttpPost]
    [RequirePermission("tasks.lists.create")]
    public async Task<IActionResult> Create(CreateTaskListCommand command)
    {
        var id = await _sender.Send(command);
        return Created($"api/v1/task-lists/{id}", new { id });
    }
}
