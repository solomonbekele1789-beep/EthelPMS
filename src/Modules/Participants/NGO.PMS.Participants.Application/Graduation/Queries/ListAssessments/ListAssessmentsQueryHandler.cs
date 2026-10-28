using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Application.DTOs;

namespace NGO.PMS.Participants.Application.Graduation.Queries.ListAssessments;

public class ListAssessmentsQueryHandler
    : IRequestHandler<ListAssessmentsQuery, List<GraduationAssessmentDto>>
{
    private readonly IParticipantsDbContext _db;
    private readonly IMapper _mapper;

    public ListAssessmentsQueryHandler(IParticipantsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<GraduationAssessmentDto>> Handle(
        ListAssessmentsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.GraduationAssessments
            .Where(a => a.ParticipantId == request.ParticipantId);

        if (request.BenchmarkId.HasValue)
            query = query.Where(a => a.BenchmarkId == request.BenchmarkId.Value);

        return await query
            .OrderByDescending(a => a.AssessmentDate)
            .ProjectTo<GraduationAssessmentDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
