using MediatR;
using NGO.PMS.Tasks.Application.DTOs;

namespace NGO.PMS.Tasks.Application.Queries.GetTask;

public sealed record GetTaskQuery(Guid TaskId) : IRequest<TaskItemDto>;
