using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Assets.Application.Commands.Assets.CalculateDepreciation;

public sealed class CalculateDepreciationCommandHandler : IRequestHandler<CalculateDepreciationCommand, Unit>
{
    private readonly IAssetsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CalculateDepreciationCommandHandler(IAssetsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(CalculateDepreciationCommand request, CancellationToken ct)
    {
        var asset = await _db.Assets
            .FirstOrDefaultAsync(a => a.Id == request.AssetId, ct);

        if (asset is null)
            throw new NotFoundException(nameof(Domain.Entities.Asset), request.AssetId);

        asset.CalculateDepreciation(request.AsOfDate);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
