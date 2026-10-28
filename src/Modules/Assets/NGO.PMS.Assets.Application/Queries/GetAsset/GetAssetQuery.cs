using MediatR;
using NGO.PMS.Assets.Application.DTOs;

namespace NGO.PMS.Assets.Application.Queries.GetAsset;

public sealed record GetAssetQuery(Guid AssetId) : IRequest<AssetDto>;
