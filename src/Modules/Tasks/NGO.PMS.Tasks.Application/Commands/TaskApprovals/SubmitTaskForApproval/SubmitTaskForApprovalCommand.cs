using MediatR;

namespace NGO.PMS.Tasks.Application.Commands.TaskApprovals.SubmitTaskForApproval;

public sealed record SubmitTaskForApprovalCommand(
    Guid TaskId,
    string? Comments = null) : IRequest<Guid>;
