using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.Training.Application.DTOs;

namespace NGO.PMS.Training.Application.Queries.ListTrainingSessions;

public class ListTrainingSessionsQueryHandler : IRequestHandler<ListTrainingSessionsQuery, PagedResult<TrainingSessionDto>>
{
    private readonly ITrainingDbContext _db;
    private readonly IMapper _mapper;

    public ListTrainingSessionsQueryHandler(ITrainingDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PagedResult<TrainingSessionDto>> Handle(
        ListTrainingSessionsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.TrainingSessions.AsQueryable();

        if (request.ProgramId.HasValue)
            query = query.Where(s => s.TrainingProgramId == request.ProgramId.Value);

        if (request.Status.HasValue)
            query = query.Where(s => s.Status == request.Status.Value);

        if (request.FromDate.HasValue)
            query = query.Where(s => s.ScheduledDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(s => s.ScheduledDate <= request.ToDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(s => s.ScheduledDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<TrainingSessionDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return new PagedResult<TrainingSessionDto>(items, totalCount, request.Page, request.PageSize);
    }
}
