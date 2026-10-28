using MediatR;
using NGO.PMS.Assets.Domain.Enums;

namespace NGO.PMS.Assets.Application.Commands.Assets.RegisterAsset;

public sealed record RegisterAssetCommand(
    string Name,
    Guid AssetCategoryId,
    string Location,
    DateTime PurchaseDate,
    decimal PurchaseCost,
    DepreciationMethod DepreciationMethod,
    decimal UsefulLifeYears,
    decimal ResidualValue,
    string? SerialNumber,
    string? ModelNumber,
    Guid? DonorGrantId,
    Guid? ProjectId,
    Guid? PurchaseOrderId,
    string? Description) : IRequest<Guid>;
