using AutoMapper;
using NGO.PMS.Dashboards.Application.DTOs;
using NGO.PMS.Dashboards.Domain.Entities;

namespace NGO.PMS.Dashboards.Application.Mappings;

public class DashboardsMappingProfile : Profile
{
    public DashboardsMappingProfile()
    {
        CreateMap<DashboardConfig, DashboardConfigDto>()
            .ForMember(d => d.DashboardType, o => o.MapFrom(s => s.DashboardType.ToString()))
            .ForMember(d => d.WidgetCount, o => o.MapFrom(s => s.Widgets.Count));

        CreateMap<DashboardConfig, DashboardSummaryDto>()
            .ForMember(d => d.DashboardType, o => o.MapFrom(s => s.DashboardType.ToString()))
            .ForMember(d => d.WidgetCount, o => o.MapFrom(s => s.Widgets.Count));

        CreateMap<DashboardWidget, DashboardWidgetDto>()
            .ForMember(d => d.WidgetType, o => o.MapFrom(s => s.WidgetType.ToString()));

        CreateMap<SavedFilter, SavedFilterDto>();
    }
}
