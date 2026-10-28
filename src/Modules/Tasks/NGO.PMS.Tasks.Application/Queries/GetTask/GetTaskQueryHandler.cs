using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Application.Abstractions;
using NGO.PMS.Tasks.Application.DTOs;

namespace NGO.PMS.Tasks.Application.Queries.GetTask;

public sealed class GetTaskQueryHandler : IRequestHandler<GetTaskQuery, TaskItemDto>
{
    private readonly ITasksDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public GetTaskQueryHandler(ITasksDbContext db, IMapper mapper, ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<TaskItemDto> Handle(GetTaskQuery request, CancellationToken cancellationToken)
    {
        var task = await _db.TaskItems
            .Include(t => t.Assignments)
            .Include(t => t.Comments)
            .Include(t => t.ApprovalLogs)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken)
            ?? throw new InvalidOperationException($"Task {request.TaskId} not found.");

        return _mapper.Map<TaskItemDto>(task);
    }
}
