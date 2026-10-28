using AutoMapper;
using NGO.PMS.Settings.Application.DTOs;
using NGO.PMS.Settings.Domain.Entities;

namespace NGO.PMS.Settings.Application.Mappings;

public class SettingsMappingProfile : Profile
{
    public SettingsMappingProfile()
    {
        CreateMap<SystemSetting, SystemSettingDto>()
            .ForMember(d => d.DataType, o => o.MapFrom(s => s.DataType.ToString()));

        CreateMap<OrgSetting, OrgSettingDto>()
            .ForMember(d => d.DataType, o => o.MapFrom(s => s.DataType.ToString()));

        CreateMap<ApprovalConfig, ApprovalConfigDto>();

        CreateMap<AlertThreshold, AlertThresholdDto>()
            .ForMember(d => d.Operator, o => o.MapFrom(s => s.Operator.ToString()))
            .ForMember(d => d.AlertSeverity, o => o.MapFrom(s => s.AlertSeverity.ToString()));
    }
}
