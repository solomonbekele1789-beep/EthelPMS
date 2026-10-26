using MediatR;
using NGO.PMS.Assets.Application.DTOs;
using NGO.PMS.Assets.Domain.Enums;

namespace NGO.PMS.Assets.Application.Queries.ListAssets;

public sealed record ListAssetsQuery(
    Guid? CategoryId,
    AssetStatus? Status,
    Guid? ProjectId,
    string? Search,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<AssetDto>>;
