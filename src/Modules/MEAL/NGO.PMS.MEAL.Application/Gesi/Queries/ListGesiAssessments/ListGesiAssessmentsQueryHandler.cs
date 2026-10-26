using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Application.DTOs;

namespace NGO.PMS.MEAL.Application.Gesi.Queries.ListGesiAssessments;

public class ListGesiAssessmentsQueryHandler : IRequestHandler<ListGesiAssessmentsQuery, List<GesiAssessmentDto>>
{
    private readonly IMealDbContext _db;
    private readonly IMapper _mapper;

    public ListGesiAssessmentsQueryHandler(IMealDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<GesiAssessmentDto>> Handle(ListGesiAssessmentsQuery request, CancellationToken ct)
    {
        return await _db.GesiAssessments
            .Where(g => g.ProjectId == request.ProjectId)
            .OrderByDescending(g => g.AssessmentDate)
            .ProjectTo<GesiAssessmentDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
