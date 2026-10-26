using MediatR;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Application.Abstractions;
using NGO.PMS.Tasks.Domain.Entities;

namespace NGO.PMS.Tasks.Application.Commands.TaskComments.AddTaskComment;

public sealed class AddTaskCommentCommandHandler : IRequestHandler<AddTaskCommentCommand, Guid>
{
    private readonly ITasksDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddTaskCommentCommandHandler(ITasksDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AddTaskCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = TaskComment.Create(
            request.TaskItemId,
            request.Content,
            _currentUser.UserId,
            _currentUser.FullName,
            _currentUser.OrganizationId,
            request.ParentCommentId);

        _db.TaskComments.Add(comment);
        await _db.SaveChangesAsync(cancellationToken);

        return comment.Id;
    }
}
