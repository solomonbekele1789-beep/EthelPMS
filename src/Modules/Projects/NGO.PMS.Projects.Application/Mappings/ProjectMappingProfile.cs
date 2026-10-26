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
            .ForMember(d => d.InterventionAreaName, o => o.MapFrom(s => s.InterventionArea.Name));
    }
}
