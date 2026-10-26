using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Assets.Application.Commands.Disposals.CompleteDisposal;

public sealed class CompleteDisposalCommandHandler : IRequestHandler<CompleteDisposalCommand, Unit>
{
    private readonly IAssetsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CompleteDisposalCommandHandler(IAssetsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(CompleteDisposalCommand request, CancellationToken ct)
    {
        var disposal = await _db.AssetDisposals
            .FirstOrDefaultAsync(d => d.Id == request.DisposalId, ct);

        if (disposal is null)
            throw new NotFoundException(nameof(AssetDisposal), request.DisposalId);

        disposal.Complete(request.DisposalValue, request.DisposalDate, _currentUser.UserId);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
