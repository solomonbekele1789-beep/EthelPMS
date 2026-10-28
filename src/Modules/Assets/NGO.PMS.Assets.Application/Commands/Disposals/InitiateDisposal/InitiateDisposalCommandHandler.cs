using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Assets.Application.Commands.Disposals.InitiateDisposal;

public sealed class InitiateDisposalCommandHandler : IRequestHandler<InitiateDisposalCommand, Guid>
{
    private readonly IAssetsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public InitiateDisposalCommandHandler(IAssetsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(InitiateDisposalCommand request, CancellationToken ct)
    {
        var asset = await _db.Assets
            .FirstOrDefaultAsync(a => a.Id == request.AssetId, ct);

        if (asset is null)
            throw new NotFoundException(nameof(Asset), request.AssetId);

        var disposal = AssetDisposal.Create(
            request.AssetId,
            request.Reason,
            request.DisposalMethod,
            asset.CurrentBookValue,
            request.RequiresDonorApproval,
            request.DonorGrantId,
            _currentUser.OrganizationId);

        _db.AssetDisposals.Add(disposal);
        await _db.SaveChangesAsync(ct);
        return disposal.Id;
    }
}
