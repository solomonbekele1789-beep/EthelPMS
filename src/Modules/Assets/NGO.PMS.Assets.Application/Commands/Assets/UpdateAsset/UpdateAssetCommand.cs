using MediatR;

namespace NGO.PMS.Assets.Application.Commands.Assets.UpdateAsset;

public sealed record UpdateAssetCommand(
    Guid Id,
    string Name,
    string? Description,
    string? SerialNumber,
    string? ModelNumber) : IRequest<Unit>;
