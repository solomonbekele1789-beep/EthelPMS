using MediatR;
using NGO.PMS.Assets.Domain.Enums;

namespace NGO.PMS.Assets.Application.Commands.AssetCategories.CreateAssetCategory;

public sealed record CreateAssetCategoryCommand(
    string Code,
    string Name,
    DepreciationMethod DefaultDepreciationMethod,
    decimal DefaultUsefulLifeYears,
    decimal DefaultResidualValuePercent,
    string? Description) : IRequest<Guid>;
