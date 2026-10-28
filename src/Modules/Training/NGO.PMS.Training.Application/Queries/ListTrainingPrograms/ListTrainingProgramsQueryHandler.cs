using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.Training.Application.DTOs;

namespace NGO.PMS.Training.Application.Queries.ListTrainingPrograms;

public class ListTrainingProgramsQueryHandler : IRequestHandler<ListTrainingProgramsQuery, PagedResult<TrainingProgramDto>>
{
    private readonly ITrainingDbContext _db;
    private readonly IMapper _mapper;

    public ListTrainingProgramsQueryHandler(ITrainingDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PagedResult<TrainingProgramDto>> Handle(
        ListTrainingProgramsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.TrainingPrograms.AsQueryable();

        if (request.ProjectId.HasValue)
            query = query.Where(p => p.ProjectId == request.ProjectId.Value);

        if (request.Category.HasValue)
            query = query.Where(p => p.Category == request.Category.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<TrainingProgramDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return new PagedResult<TrainingProgramDto>(items, totalCount, request.Page, request.PageSize);
    }
}
