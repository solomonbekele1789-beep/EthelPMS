using MediatR;

namespace NGO.PMS.Tasks.Application.Commands.TaskComments.AddTaskComment;

public sealed record AddTaskCommentCommand(
    Guid TaskItemId,
    string Content,
    Guid? ParentCommentId = null) : IRequest<Guid>;
