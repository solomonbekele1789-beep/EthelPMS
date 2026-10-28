using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Training.Application.Abstractions;
using NGO.PMS.Training.Application.DTOs;

namespace NGO.PMS.Training.Application.Queries.ListTrainers;

public class ListTrainersQueryHandler : IRequestHandler<ListTrainersQuery, PagedResult<TrainerDto>>
{
    private readonly ITrainingDbContext _db;
    private readonly IMapper _mapper;

    public ListTrainersQueryHandler(ITrainingDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PagedResult<TrainerDto>> Handle(
        ListTrainersQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Trainers.Where(t => t.IsActive);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(t => t.FullName)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<TrainerDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return new PagedResult<TrainerDto>(items, totalCount, request.Page, request.PageSize);
    }
}
