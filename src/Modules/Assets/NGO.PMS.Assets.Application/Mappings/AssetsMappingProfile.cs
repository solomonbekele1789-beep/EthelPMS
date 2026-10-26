using AutoMapper;
using NGO.PMS.Assets.Application.DTOs;
using NGO.PMS.Assets.Domain.Entities;

namespace NGO.PMS.Assets.Application.Mappings;

public class AssetsMappingProfile : Profile
{
    public AssetsMappingProfile()
    {
        CreateMap<AssetCategory, AssetCategoryDto>()
            .ForMember(d => d.DefaultDepreciationMethod, o => o.MapFrom(s => s.DefaultDepreciationMethod.ToString()));

        CreateMap<Asset, AssetDto>()
            .ForMember(d => d.DepreciationMethod, o => o.MapFrom(s => s.DepreciationMethod.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.Condition, o => o.MapFrom(s => s.Condition.ToString()))
            .ForMember(d => d.CategoryName, o => o.Ignore());

        CreateMap<AssetAssignment, AssetAssignmentDto>()
            .ForMember(d => d.AssetName, o => o.Ignore());

        CreateMap<AssetTransfer, AssetTransferDto>()
            .ForMember(d => d.AssetName, o => o.Ignore());

        CreateMap<AssetDisposal, AssetDisposalDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.AssetName, o => o.Ignore());

        CreateMap<AssetMaintenance, AssetMaintenanceDto>()
            .ForMember(d => d.AssetName, o => o.Ignore());

        CreateMap<StockItem, StockItemDto>();

        CreateMap<StockMovement, StockMovementDto>()
            .ForMember(d => d.MovementType, o => o.MapFrom(s => s.MovementType.ToString()))
            .ForMember(d => d.ItemName, o => o.Ignore());
    }
}
