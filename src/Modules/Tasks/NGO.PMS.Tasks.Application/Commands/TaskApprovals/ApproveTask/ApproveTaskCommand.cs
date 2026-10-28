using MediatR;

namespace NGO.PMS.Tasks.Application.Commands.TaskApprovals.ApproveTask;

public sealed record ApproveTaskCommand(
    Guid TaskId,
    int ApprovalLevel,
    string? Comments = null) : IRequest<Guid>;
