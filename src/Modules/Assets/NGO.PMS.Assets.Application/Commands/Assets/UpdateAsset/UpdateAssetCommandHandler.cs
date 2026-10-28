using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Assets.Application.Commands.Assets.UpdateAsset;

public sealed class UpdateAssetCommandHandler : IRequestHandler<UpdateAssetCommand, Unit>
{
    private readonly IAssetsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateAssetCommandHandler(IAssetsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(UpdateAssetCommand request, CancellationToken ct)
    {
        var asset = await _db.Assets
            .FirstOrDefaultAsync(a => a.Id == request.Id, ct);

        if (asset is null)
            throw new NotFoundException(nameof(Domain.Entities.Asset), request.Id);

        asset.UpdateDetails(request.Name, request.Description, request.SerialNumber, request.ModelNumber);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
