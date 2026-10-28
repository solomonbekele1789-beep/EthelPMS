using MediatR;
using NGO.PMS.Assets.Domain.Enums;

namespace NGO.PMS.Assets.Application.Commands.AssetCategories.UpdateAssetCategory;

public sealed record UpdateAssetCategoryCommand(
    Guid Id,
    string Name,
    string? Description,
    DepreciationMethod DefaultDepreciationMethod,
    decimal DefaultUsefulLifeYears,
    decimal DefaultResidualValuePercent) : IRequest<Unit>;
