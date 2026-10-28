using MediatR;
using NGO.PMS.Assets.Application.DTOs;

namespace NGO.PMS.Assets.Application.Queries.ListAssetCategories;

public sealed record ListAssetCategoriesQuery(
    string? Search) : IRequest<List<AssetCategoryDto>>;
