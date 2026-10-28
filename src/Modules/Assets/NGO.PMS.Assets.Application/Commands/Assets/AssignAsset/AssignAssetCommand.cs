using MediatR;

namespace NGO.PMS.Assets.Application.Commands.Assets.AssignAsset;

public sealed record AssignAssetCommand(
    Guid AssetId,
    Guid AssignedToUserId,
    string AssignedToName,
    DateTime AssignmentDate,
    string? Notes) : IRequest<Guid>;
