using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Assets.Application.Commands.Assets.TransferAsset;

public sealed class TransferAssetCommandHandler : IRequestHandler<TransferAssetCommand, Guid>
{
    private readonly IAssetsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public TransferAssetCommandHandler(IAssetsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(TransferAssetCommand request, CancellationToken ct)
    {
        var asset = await _db.Assets
            .FirstOrDefaultAsync(a => a.Id == request.AssetId, ct);

        if (asset is null)
            throw new NotFoundException(nameof(Domain.Entities.Asset), request.AssetId);

        var transfer = AssetTransfer.Create(
            request.AssetId,
            asset.Location,
            request.ToLocation,
            request.TransferDate,
            request.Reason,
            request.ApprovedBy,
            _currentUser.OrganizationId);

        asset.UpdateLocation(request.ToLocation);

        _db.AssetTransfers.Add(transfer);
        await _db.SaveChangesAsync(ct);
        return transfer.Id;
    }
}
