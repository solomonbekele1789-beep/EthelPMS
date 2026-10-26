using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Risk.Application.Abstractions;
using NGO.PMS.Risk.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Risk.Application.Risks.Queries.GetRisk;

public class GetRiskQueryHandler : IRequestHandler<GetRiskQuery, RiskDto>
{
    private readonly IRiskDbContext _db;
    private readonly IMapper _mapper;

    public GetRiskQueryHandler(IRiskDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<RiskDto> Handle(GetRiskQuery request, CancellationToken cancellationToken)
    {
        var risk = await _db.Risks
            .Include(r => r.Mitigations)
            .Include(r => r.Assessments)
            .FirstOrDefaultAsync(r => r.Id == request.RiskId, cancellationToken)
            ?? throw new NotFoundException("Risk", request.RiskId);

        return _mapper.Map<RiskDto>(risk);
    }
}
