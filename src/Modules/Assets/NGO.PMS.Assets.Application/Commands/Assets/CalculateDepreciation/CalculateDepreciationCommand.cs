using MediatR;

namespace NGO.PMS.Assets.Application.Commands.Assets.CalculateDepreciation;

public sealed record CalculateDepreciationCommand(
    Guid AssetId,
    DateTime AsOfDate) : IRequest<Unit>;
