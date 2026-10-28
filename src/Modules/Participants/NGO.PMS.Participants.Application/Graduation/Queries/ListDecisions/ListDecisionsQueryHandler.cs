using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Application.DTOs;

namespace NGO.PMS.Participants.Application.Graduation.Queries.ListDecisions;

public class ListDecisionsQueryHandler
    : IRequestHandler<ListDecisionsQuery, List<GraduationDecisionDto>>
{
    private readonly IParticipantsDbContext _db;
    private readonly IMapper _mapper;

    public ListDecisionsQueryHandler(IParticipantsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<GraduationDecisionDto>> Handle(
        ListDecisionsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.GraduationDecisions.AsQueryable();

        if (request.ProjectId.HasValue)
            query = query.Where(d => d.ProjectId == request.ProjectId.Value);

        if (request.ParticipantId.HasValue)
            query = query.Where(d => d.ParticipantId == request.ParticipantId.Value);

        return await query
            .OrderByDescending(d => d.CreatedAt)
            .ProjectTo<GraduationDecisionDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
