using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.Partnerships.Application.DTOs;

namespace NGO.PMS.Partnerships.Application.Queries.GetSubGrantees;

public sealed class GetSubGranteesQueryHandler : IRequestHandler<GetSubGranteesQuery, List<SubGranteeListDto>>
{
    private readonly IPartnershipsDbContext _db;
    private readonly IMapper _mapper;

    public GetSubGranteesQueryHandler(IPartnershipsDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<SubGranteeListDto>> Handle(GetSubGranteesQuery request, CancellationToken ct)
    {
        var query = _db.SubGrantees.AsNoTracking().AsQueryable();

        if (request.Status.HasValue)
            query = query.Where(x => x.Status == request.Status.Value);

        if (request.PartnerType.HasValue)
            query = query.Where(x => x.PartnerType == request.PartnerType.Value);

        var entities = await query.ToListAsync(ct);

        return _mapper.Map<List<SubGranteeListDto>>(entities);
    }
}
