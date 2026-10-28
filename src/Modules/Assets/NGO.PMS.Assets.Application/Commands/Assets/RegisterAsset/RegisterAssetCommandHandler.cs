using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Application.Commands.Assets.RegisterAsset;

public sealed class RegisterAssetCommandHandler : IRequestHandler<RegisterAssetCommand, Guid>
{
    private readonly IAssetsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RegisterAssetCommandHandler(IAssetsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(RegisterAssetCommand request, CancellationToken ct)
    {
        var sequenceNumber = await _db.Assets.CountAsync(ct) + 1;
        var assetCode = $"ETHEL-A-{sequenceNumber:D6}";

        var asset = Asset.Create(
            assetCode,
            request.Name,
            request.AssetCategoryId,
            request.Location,
            request.PurchaseDate,
            request.PurchaseCost,
            request.DepreciationMethod,
            request.UsefulLifeYears,
            request.ResidualValue,
            _currentUser.OrganizationId);

        if (request.SerialNumber is not null || request.ModelNumber is not null || request.Description is not null)
            asset.UpdateDetails(request.Name, request.Description, request.SerialNumber, request.ModelNumber);

        if (request.DonorGrantId.HasValue)
            asset.LinkToDonor(request.DonorGrantId.Value);

        if (request.ProjectId.HasValue)
            asset.ProjectId = request.ProjectId;

        if (request.PurchaseOrderId.HasValue)
            asset.LinkToPurchaseOrder(request.PurchaseOrderId.Value);

        _db.Assets.Add(asset);
        await _db.SaveChangesAsync(ct);
        return asset.Id;
    }
}
