using MediatR;
using NGO.PMS.Risk.Application.DTOs;
using NGO.PMS.Risk.Domain.Enums;

namespace NGO.PMS.Risk.Application.Risks.Queries.ListRisks;

public sealed record ListRisksQuery(
    Guid? ProjectId = null,
    RiskStatus? Status = null,
    Guid? CategoryId = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<RiskDto>>;
