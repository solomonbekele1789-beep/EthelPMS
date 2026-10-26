using MediatR;
using NGO.PMS.Tasks.Application.DTOs;
using NGO.PMS.Tasks.Domain.Enums;

namespace NGO.PMS.Tasks.Application.Queries.ListTasks;

public sealed record ListTasksQuery(
    Guid? BoardId = null,
    Guid? ListId = null,
    Guid? ProjectId = null,
    TaskItemStatus? Status = null,
    Guid? AssignedToUserId = null,
    string? Search = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<TaskItemDto>>;
