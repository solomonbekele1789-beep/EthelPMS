using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Assets.Application.Commands.AssetCategories.UpdateAssetCategory;

public sealed class UpdateAssetCategoryCommandHandler : IRequestHandler<UpdateAssetCategoryCommand, Unit>
{
    private readonly IAssetsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateAssetCategoryCommandHandler(IAssetsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(UpdateAssetCategoryCommand request, CancellationToken ct)
    {
        var category = await _db.AssetCategories
            .FirstOrDefaultAsync(c => c.Id == request.Id, ct);

        if (category is null)
            throw new NotFoundException(nameof(Domain.Entities.AssetCategory), request.Id);

        category.Update(
            request.Name,
            request.Description,
            request.DefaultDepreciationMethod,
            request.DefaultUsefulLifeYears,
            request.DefaultResidualValuePercent);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
