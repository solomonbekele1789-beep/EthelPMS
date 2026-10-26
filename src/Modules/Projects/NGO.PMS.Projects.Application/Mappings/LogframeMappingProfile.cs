using AutoMapper;
using NGO.PMS.Projects.Application.DTOs;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Application.Mappings;

public class LogframeMappingProfile : Profile
{
    public LogframeMappingProfile()
    {
        CreateMap<Outcome, LogframeOutcomeDto>();
        CreateMap<Output, LogframeOutputDto>();
        CreateMap<Activity, LogframeActivityDto>();
    }
}
