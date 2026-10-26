using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Application.Abstractions;
using NGO.PMS.Tasks.Application.DTOs;

namespace NGO.PMS.Tasks.Application.Queries.ListTasks;

public sealed class ListTasksQueryHandler : IRequestHandler<ListTasksQuery, PagedResult<TaskItemDto>>
{
    private readonly ITasksDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public ListTasksQueryHandler(ITasksDbContext db, IMapper mapper, ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<TaskItemDto>> Handle(ListTasksQuery request, CancellationToken cancellationToken)
    {
        var query = _db.TaskItems.AsQueryable();

        if (request.BoardId.HasValue)
        {
            var listIds = await _db.TaskLists
                .Where(l => l.TaskBoardId == request.BoardId.Value)
                .Select(l => l.Id)
                .ToListAsync(cancellationToken);

            query = query.Where(t => listIds.Contains(t.TaskListId));
        }

        if (request.ListId.HasValue)
            query = query.Where(t => t.TaskListId == request.ListId.Value);

        if (request.ProjectId.HasValue)
            query = query.Where(t => t.ProjectId == request.ProjectId.Value);

        if (request.Status.HasValue)
            query = query.Where(t => t.Status == request.Status.Value);

        if (request.AssignedToUserId.HasValue)
            query = query.Where(t => t.AssignedToUserId == request.AssignedToUserId.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(t => t.Title.Contains(request.Search) || (t.Description != null && t.Description.Contains(request.Search)));

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(t => t.SortOrder)
            .ThenByDescending(t => t.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Include(t => t.Assignments)
            .Include(t => t.Comments)
            .ProjectTo<TaskItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return new PagedResult<TaskItemDto>(items, totalCount, request.Page, request.PageSize);
    }
}
