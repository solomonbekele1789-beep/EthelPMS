using AutoMapper;
using NGO.PMS.PlatformAdmin.Application.AccessKeys.DTOs;
using NGO.PMS.PlatformAdmin.Application.Subscriptions.DTOs;
using NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;
using NGO.PMS.PlatformAdmin.Domain.Entities;

namespace NGO.PMS.PlatformAdmin.Application.Mappings;

public class TenantMappingProfile : Profile
{
    public TenantMappingProfile()
    {
        CreateMap<PlatformTenant, TenantListItemDto>()
            .ForCtorParam("SubscriptionName", opt => opt.MapFrom(src => src.SubscriptionPackage.Name));

        CreateMap<PlatformTenant, TenantDetailDto>()
            .ForCtorParam("Subscription", opt => opt.MapFrom(src => src.SubscriptionPackage))
            .ForCtorParam("Modules", opt => opt.MapFrom(src => src.TenantModules));

        CreateMap<TenantModule, TenantModuleDto>();

        CreateMap<SubscriptionPackage, SubscriptionPackageDto>();

        CreateMap<ProvisioningLog, ProvisioningLogDto>();

        CreateMap<TenantAccessKey, AccessKeyDto>()
            .ForCtorParam("MaskedKey", opt => opt.MapFrom(src => "****"))
            .ForCtorParam("IsRevoked", opt => opt.MapFrom(src => src.IsRevoked));
    }
}
