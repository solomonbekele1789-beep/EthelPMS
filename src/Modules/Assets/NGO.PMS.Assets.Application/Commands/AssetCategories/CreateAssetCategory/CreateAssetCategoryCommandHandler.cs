using MediatR;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Application.Commands.AssetCategories.CreateAssetCategory;

public sealed class CreateAssetCategoryCommandHandler : IRequestHandler<CreateAssetCategoryCommand, Guid>
{
    private readonly IAssetsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateAssetCategoryCommandHandler(IAssetsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateAssetCategoryCommand request, CancellationToken ct)
    {
        var category = AssetCategory.Create(
            request.Code,
            request.Name,
            request.DefaultDepreciationMethod,
            request.DefaultUsefulLifeYears,
            request.DefaultResidualValuePercent,
            _currentUser.OrganizationId);

        _db.AssetCategories.Add(category);
        await _db.SaveChangesAsync(ct);
        return category.Id;
    }
}
