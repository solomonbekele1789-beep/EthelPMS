using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NGO.PMS.SharedKernel.Authorization;
using NGO.PMS.Tasks.Application.Commands.TaskApprovals.ApproveTask;
using NGO.PMS.Tasks.Application.Commands.TaskApprovals.RejectTask;
using NGO.PMS.Tasks.Application.Commands.TaskApprovals.SubmitTaskForApproval;
using NGO.PMS.Tasks.Application.Commands.TaskComments.AddTaskComment;
using NGO.PMS.Tasks.Application.Commands.Tasks.AssignTask;
using NGO.PMS.Tasks.Application.Commands.Tasks.CreateTask;
using NGO.PMS.Tasks.Application.Commands.Tasks.MoveTask;
using NGO.PMS.Tasks.Application.Commands.Tasks.UpdateTask;
using NGO.PMS.Tasks.Application.Commands.Tasks.UpdateTaskProgress;
using NGO.PMS.Tasks.Application.Commands.Tasks.UpdateTaskStatus;
using NGO.PMS.Tasks.Application.Queries.GetTask;
using NGO.PMS.Tasks.Application.Queries.ListTaskComments;
using NGO.PMS.Tasks.Application.Queries.ListTasks;
using NGO.PMS.Tasks.Domain.Enums;

namespace NGO.PMS.Tasks.API.Controllers;

[ApiController]
[Route("api/v1/tasks")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ISender _sender;

    public TasksController(ISender sender) => _sender = sender;

    [HttpGet]
    [RequirePermission("tasks.tasks.read")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? boardId,
        [FromQuery] Guid? listId,
        [FromQuery] Guid? projectId,
        [FromQuery] TaskItemStatus? status,
        [FromQuery] Guid? assignedToUserId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _sender.Send(new ListTasksQuery(boardId, listId, projectId, status, assignedToUserId, search, page, pageSize));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("tasks.tasks.read")]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _sender.Send(new GetTaskQuery(id));
        return Ok(result);
    }

    [HttpPost]
    [RequirePermission("tasks.tasks.create")]
    public async Task<IActionResult> Create(CreateTaskCommand command)
    {
        var id = await _sender.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("tasks.tasks.update")]
    public async Task<IActionResult> Update(Guid id, UpdateTaskCommand command)
    {
        if (id != command.TaskId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [RequirePermission("tasks.tasks.update")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateTaskStatusCommand command)
    {
        if (id != command.TaskId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPatch("{id:guid}/progress")]
    [RequirePermission("tasks.tasks.update")]
    public async Task<IActionResult> UpdateProgress(Guid id, UpdateTaskProgressCommand command)
    {
        if (id != command.TaskId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id:guid}/assign")]
    [RequirePermission("tasks.tasks.assign")]
    public async Task<IActionResult> Assign(Guid id, AssignTaskCommand command)
    {
        if (id != command.TaskId) return BadRequest();
        var assignmentId = await _sender.Send(command);
        return Ok(new { id = assignmentId });
    }

    [HttpPatch("{id:guid}/move")]
    [RequirePermission("tasks.tasks.update")]
    public async Task<IActionResult> Move(Guid id, MoveTaskCommand command)
    {
        if (id != command.TaskId) return BadRequest();
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPost("{id:guid}/comments")]
    [RequirePermission("tasks.comments.create")]
    public async Task<IActionResult> AddComment(Guid id, AddTaskCommentCommand command)
    {
        if (id != command.TaskItemId) return BadRequest();
        var commentId = await _sender.Send(command);
        return Ok(new { id = commentId });
    }

    [HttpGet("{id:guid}/comments")]
    [RequirePermission("tasks.comments.read")]
    public async Task<IActionResult> ListComments(Guid id)
    {
        var result = await _sender.Send(new ListTaskCommentsQuery(id));
        return Ok(result);
    }

    [HttpPost("{id:guid}/submit-for-approval")]
    [RequirePermission("tasks.approvals.submit")]
    public async Task<IActionResult> SubmitForApproval(Guid id, SubmitTaskForApprovalCommand command)
    {
        if (id != command.TaskId) return BadRequest();
        var logId = await _sender.Send(command);
        return Ok(new { id = logId });
    }

    [HttpPost("{id:guid}/approve")]
    [RequirePermission("tasks.approvals.approve")]
    public async Task<IActionResult> Approve(Guid id, ApproveTaskCommand command)
    {
        if (id != command.TaskId) return BadRequest();
        var logId = await _sender.Send(command);
        return Ok(new { id = logId });
    }

    [HttpPost("{id:guid}/reject")]
    [RequirePermission("tasks.approvals.reject")]
    public async Task<IActionResult> Reject(Guid id, RejectTaskCommand command)
    {
        if (id != command.TaskId) return BadRequest();
        var logId = await _sender.Send(command);
        return Ok(new { id = logId });
    }
}
