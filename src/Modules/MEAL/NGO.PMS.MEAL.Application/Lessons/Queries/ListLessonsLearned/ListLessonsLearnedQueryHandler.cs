using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Application.DTOs;

namespace NGO.PMS.MEAL.Application.Lessons.Queries.ListLessonsLearned;

public class ListLessonsLearnedQueryHandler : IRequestHandler<ListLessonsLearnedQuery, List<LessonLearnedDto>>
{
    private readonly IMealDbContext _db;
    private readonly IMapper _mapper;

    public ListLessonsLearnedQueryHandler(IMealDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<LessonLearnedDto>> Handle(ListLessonsLearnedQuery request, CancellationToken ct)
    {
        var query = _db.LessonsLearned.AsQueryable();

        if (request.ProjectId.HasValue)
            query = query.Where(l => l.ProjectId == request.ProjectId.Value);
        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(l => l.Category == request.Category);

        return await query
            .OrderByDescending(l => l.CreatedAt)
            .ProjectTo<LessonLearnedDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
