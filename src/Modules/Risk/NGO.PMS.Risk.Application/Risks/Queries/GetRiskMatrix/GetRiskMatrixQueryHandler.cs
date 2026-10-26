using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Risk.Application.Abstractions;

namespace NGO.PMS.Risk.Application.Risks.Queries.GetRiskMatrix;

public class GetRiskMatrixQueryHandler : IRequestHandler<GetRiskMatrixQuery, List<RiskMatrixItemDto>>
{
    private readonly IRiskDbContext _db;

    public GetRiskMatrixQueryHandler(IRiskDbContext db)
    {
        _db = db;
    }

    public async Task<List<RiskMatrixItemDto>> Handle(GetRiskMatrixQuery request, CancellationToken cancellationToken)
    {
        var risks = await _db.Risks
            .Where(r => r.ProjectId == request.ProjectId)
            .OrderByDescending(r => r.RiskScore)
            .Select(r => new RiskMatrixItemDto
            {
                Id = r.Id,
                Title = r.Title,
                Likelihood = r.Likelihood.ToString(),
                Impact = r.Impact.ToString(),
                RiskScore = r.RiskScore,
                Status = r.Status.ToString()
            })
            .ToListAsync(cancellationToken);

        return risks;
    }
}
