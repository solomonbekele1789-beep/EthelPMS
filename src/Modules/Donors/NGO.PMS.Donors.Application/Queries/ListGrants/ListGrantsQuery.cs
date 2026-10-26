using MediatR;
using NGO.PMS.Donors.Application.DTOs;
using NGO.PMS.Donors.Domain.Enums;

namespace NGO.PMS.Donors.Application.Queries.ListGrants;

public sealed record ListGrantsQuery(
    Guid? DonorId,
    GrantStatus? Status,
    Guid? ProjectId,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<GrantDto>>;
