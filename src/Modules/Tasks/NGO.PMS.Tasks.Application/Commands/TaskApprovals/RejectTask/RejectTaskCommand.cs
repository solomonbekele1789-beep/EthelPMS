using MediatR;

namespace NGO.PMS.Tasks.Application.Commands.TaskApprovals.RejectTask;

public sealed record RejectTaskCommand(
    Guid TaskId,
    int ApprovalLevel,
    string? Comments = null) : IRequest<Guid>;
