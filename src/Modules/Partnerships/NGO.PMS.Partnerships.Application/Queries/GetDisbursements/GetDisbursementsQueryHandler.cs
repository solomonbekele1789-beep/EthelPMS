using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.Partnerships.Application.DTOs;

namespace NGO.PMS.Partnerships.Application.Queries.GetDisbursements;

public sealed class GetDisbursementsQueryHandler : IRequestHandler<GetDisbursementsQuery, List<DisbursementDto>>
{
    private readonly IPartnershipsDbContext _db;
    private readonly IMapper _mapper;

    public GetDisbursementsQueryHandler(IPartnershipsDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<DisbursementDto>> Handle(GetDisbursementsQuery request, CancellationToken ct)
    {
        var query = _db.Disbursements.AsNoTracking().AsQueryable();

        if (request.SubGranteeId.HasValue)
            query = query.Where(x => x.SubGranteeId == request.SubGranteeId.Value);

        var entities = await query
            .OrderByDescending(x => x.DisbursementDate)
            .ToListAsync(ct);

        return _mapper.Map<List<DisbursementDto>>(entities);
    }
}
