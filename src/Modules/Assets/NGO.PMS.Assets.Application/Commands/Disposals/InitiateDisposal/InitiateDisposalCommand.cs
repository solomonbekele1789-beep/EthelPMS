using MediatR;

namespace NGO.PMS.Assets.Application.Commands.Disposals.InitiateDisposal;

public sealed record InitiateDisposalCommand(
    Guid AssetId,
    string Reason,
    string DisposalMethod,
    bool RequiresDonorApproval,
    Guid? DonorGrantId) : IRequest<Guid>;
