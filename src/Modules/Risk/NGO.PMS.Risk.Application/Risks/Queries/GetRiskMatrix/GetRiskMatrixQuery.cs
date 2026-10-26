using MediatR;
using NGO.PMS.Risk.Application.DTOs;

namespace NGO.PMS.Risk.Application.Risks.Queries.GetRiskMatrix;

public sealed record GetRiskMatrixQuery(Guid ProjectId) : IRequest<List<RiskMatrixItemDto>>;

public class RiskMatrixItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Likelihood { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public string Status { get; set; } = string.Empty;
}
