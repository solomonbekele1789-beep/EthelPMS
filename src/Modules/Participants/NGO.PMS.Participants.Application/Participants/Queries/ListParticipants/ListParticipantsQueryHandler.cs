using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Application.DTOs;

namespace NGO.PMS.Participants.Application.Participants.Queries.ListParticipants;

public class ListParticipantsQueryHandler : IRequestHandler<ListParticipantsQuery, PagedResult<ParticipantListItemDto>>
{
    private readonly IParticipantsDbContext _db;
    private readonly IMapper _mapper;

    public ListParticipantsQueryHandler(IParticipantsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PagedResult<ParticipantListItemDto>> Handle(
        ListParticipantsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Participants.AsQueryable();

        if (request.Status.HasValue)
            query = query.Where(p => p.Status == request.Status.Value);

        if (request.ProjectId.HasValue)
            query = query.Where(p =>
                p.Enrollments.Any(e => e.ProjectId == request.ProjectId.Value));

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(p => p.FullName.Contains(request.Search));

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(p => p.RegistrationDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<ParticipantListItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return new PagedResult<ParticipantListItemDto>(items, totalCount, request.Page, request.PageSize);
    }
}
