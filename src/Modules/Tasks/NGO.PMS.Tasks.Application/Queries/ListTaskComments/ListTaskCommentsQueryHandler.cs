using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Application.Abstractions;
using NGO.PMS.Tasks.Application.DTOs;

namespace NGO.PMS.Tasks.Application.Queries.ListTaskComments;

public sealed class ListTaskCommentsQueryHandler : IRequestHandler<ListTaskCommentsQuery, List<TaskCommentDto>>
{
    private readonly ITasksDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public ListTaskCommentsQueryHandler(ITasksDbContext db, IMapper mapper, ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<List<TaskCommentDto>> Handle(ListTaskCommentsQuery request, CancellationToken cancellationToken)
    {
        return await _db.TaskComments
            .Where(c => c.TaskItemId == request.TaskItemId)
            .OrderBy(c => c.CreatedAt)
            .ProjectTo<TaskCommentDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
