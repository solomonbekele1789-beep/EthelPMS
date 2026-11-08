using AutoMapper;
using NGO.PMS.Projects.Application.DTOs;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Application.Mappings;

public class ProjectMappingProfile : Profile
{
    public ProjectMappingProfile()
    {
        CreateMap<Project, ProjectDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.OperationalStatus, o => o.MapFrom(s => s.OperationalStatus.ToString()));

        CreateMap<Project, ProjectListItemDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.OperationalStatus, o => o.MapFrom(s => s.OperationalStatus.ToString()));

        CreateMap<Outcome, OutcomeDto>();
        CreateMap<Output, OutputDto>();
        CreateMap<Activity, ActivityDto>();
        CreateMap<Indicator, IndicatorDto>();
        CreateMap<IndicatorTarget, IndicatorTargetDto>();
        CreateMap<InterventionArea, InterventionAreaDto>();
        CreateMap<ProjectInterventionArea, ProjectInterventionAreaDto>()
            .ForMember(d => d.InterventionAreaName, o => o.MapFrom(s => s.InterventionArea.Name))
            .ForMember(d => d.InterventionAreaCode, o => o.MapFrom(s => s.InterventionArea.Code))
            .ForMember(d => d.AreaType, o => o.MapFrom(s => s.InterventionArea.AreaType))
            .ForMember(d => d.Latitude, o => o.MapFrom(s => s.InterventionArea.Latitude))
            .ForMember(d => d.Longitude, o => o.MapFrom(s => s.InterventionArea.Longitude))
            .ForMember(d => d.LandmarkOrAddress, o => o.MapFrom(s => s.InterventionArea.LandmarkOrAddress))
            .ForMember(d => d.ParentName, o => o.MapFrom(s => s.InterventionArea.Parent != null ? s.InterventionArea.Parent.Name : null));
    }
}
