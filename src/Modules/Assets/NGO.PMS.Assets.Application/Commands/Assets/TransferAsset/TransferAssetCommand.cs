using MediatR;

namespace NGO.PMS.Assets.Application.Commands.Assets.TransferAsset;

public sealed record TransferAssetCommand(
    Guid AssetId,
    string ToLocation,
    DateTime TransferDate,
    string Reason,
    string ApprovedBy) : IRequest<Guid>;
