using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Application.Abstractions;
using NGO.PMS.Tasks.Application.DTOs;

namespace NGO.PMS.Tasks.Application.Queries.GetTaskBoard;

public sealed class GetTaskBoardQueryHandler : IRequestHandler<GetTaskBoardQuery, TaskBoardDto>
{
    private readonly ITasksDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public GetTaskBoardQueryHandler(ITasksDbContext db, IMapper mapper, ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<TaskBoardDto> Handle(GetTaskBoardQuery request, CancellationToken cancellationToken)
    {
        var board = await _db.TaskBoards
            .Include(b => b.Lists)
                .ThenInclude(l => l.Tasks)
            .FirstOrDefaultAsync(b => b.Id == request.BoardId, cancellationToken)
            ?? throw new InvalidOperationException($"Task board {request.BoardId} not found.");

        return _mapper.Map<TaskBoardDto>(board);
    }
}
