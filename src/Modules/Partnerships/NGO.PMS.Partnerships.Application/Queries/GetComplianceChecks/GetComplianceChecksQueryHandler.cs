using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.Partnerships.Application.DTOs;

namespace NGO.PMS.Partnerships.Application.Queries.GetComplianceChecks;

public sealed class GetComplianceChecksQueryHandler : IRequestHandler<GetComplianceChecksQuery, List<PartnerComplianceDto>>
{
    private readonly IPartnershipsDbContext _db;
    private readonly IMapper _mapper;

    public GetComplianceChecksQueryHandler(IPartnershipsDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<PartnerComplianceDto>> Handle(GetComplianceChecksQuery request, CancellationToken ct)
    {
        var query = _db.PartnerCompliances.AsNoTracking().AsQueryable();

        if (request.SubGranteeId.HasValue)
            query = query.Where(x => x.SubGranteeId == request.SubGranteeId.Value);

        var entities = await query
            .OrderByDescending(x => x.CheckDate)
            .ToListAsync(ct);

        return _mapper.Map<List<PartnerComplianceDto>>(entities);
    }
}
