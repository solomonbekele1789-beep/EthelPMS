using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Application.DTOs;

namespace NGO.PMS.Participants.Application.Participants.Queries.ListParticipantServices;

public class ListParticipantServicesQueryHandler
    : IRequestHandler<ListParticipantServicesQuery, List<ParticipantServiceDto>>
{
    private readonly IParticipantsDbContext _db;
    private readonly IMapper _mapper;

    public ListParticipantServicesQueryHandler(IParticipantsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<ParticipantServiceDto>> Handle(
        ListParticipantServicesQuery request, CancellationToken cancellationToken)
    {
        var query = _db.ParticipantServices
            .Where(s => s.ParticipantId == request.ParticipantId);

        if (request.ProjectId.HasValue)
            query = query.Where(s => s.ProjectId == request.ProjectId.Value);

        return await query
            .OrderByDescending(s => s.ServiceDate)
            .ProjectTo<ParticipantServiceDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
