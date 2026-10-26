using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Assets.Application.Queries.GetAsset;

public sealed class GetAssetQueryHandler : IRequestHandler<GetAssetQuery, AssetDto>
{
    private readonly IAssetsDbContext _db;
    private readonly IMapper _mapper;

    public GetAssetQueryHandler(IAssetsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<AssetDto> Handle(GetAssetQuery request, CancellationToken ct)
    {
        var asset = await _db.Assets
            .FirstOrDefaultAsync(a => a.Id == request.AssetId, ct);

        if (asset is null)
            throw new NotFoundException(nameof(Domain.Entities.Asset), request.AssetId);

        var dto = _mapper.Map<AssetDto>(asset);

        var category = await _db.AssetCategories
            .FirstOrDefaultAsync(c => c.Id == asset.AssetCategoryId, ct);

        if (category is not null)
            dto.CategoryName = category.Name;

        return dto;
    }
}
