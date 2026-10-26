using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Participants.Application.Abstractions;
using NGO.PMS.Participants.Application.DTOs;

namespace NGO.PMS.Participants.Application.Participants.Queries.ListHouseholdMembers;

public class ListHouseholdMembersQueryHandler : IRequestHandler<ListHouseholdMembersQuery, List<HouseholdMemberDto>>
{
    private readonly IParticipantsDbContext _db;
    private readonly IMapper _mapper;

    public ListHouseholdMembersQueryHandler(IParticipantsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<HouseholdMemberDto>> Handle(
        ListHouseholdMembersQuery request, CancellationToken cancellationToken)
    {
        return await _db.HouseholdMembers
            .Where(h => h.HouseholdCode == request.HouseholdCode)
            .OrderByDescending(h => h.IsHeadOfHousehold)
            .ProjectTo<HouseholdMemberDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
