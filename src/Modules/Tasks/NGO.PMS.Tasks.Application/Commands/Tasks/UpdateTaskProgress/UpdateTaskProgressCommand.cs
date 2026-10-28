using MediatR;

namespace NGO.PMS.Tasks.Application.Commands.Tasks.UpdateTaskProgress;

public sealed record UpdateTaskProgressCommand(
    Guid TaskId,
    int ProgressPercentage) : IRequest<Unit>;
