using MediatR;
using NGO.PMS.Assets.Application.DTOs;
using NGO.PMS.Assets.Domain.Enums;

namespace NGO.PMS.Assets.Application.Queries.ListDisposals;

public sealed record ListDisposalsQuery(
    DisposalStatus? Status,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<AssetDisposalDto>>;
