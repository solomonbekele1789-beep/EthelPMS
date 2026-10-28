using MediatR;

namespace NGO.PMS.Assets.Application.Commands.Disposals.CompleteDisposal;

public sealed record CompleteDisposalCommand(
    Guid DisposalId,
    decimal DisposalValue,
    DateTime DisposalDate) : IRequest<Unit>;
