using AutoMapper;
using NGO.PMS.Planning.Application.DTOs;
using NGO.PMS.Planning.Domain.Entities;

namespace NGO.PMS.Planning.Application.Mappings;

public class PlanningMappingProfile : Profile
{
    public PlanningMappingProfile()
    {
        CreateMap<PlanEntry, PlanEntryDto>()
            .ForMember(d => d.Level, opt => opt.MapFrom(s => s.Level.ToString()))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.ApprovalStatus, opt => opt.MapFrom(s => s.ApprovalStatus.ToString()));

        CreateMap<PlanEntry, PlanEntryListItemDto>()
            .ForMember(d => d.Level, opt => opt.MapFrom(s => s.Level.ToString()))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.ApprovalStatus, opt => opt.MapFrom(s => s.ApprovalStatus.ToString()))
            .ForMember(d => d.ChildCount, opt => opt.MapFrom(s => s.Children.Count));

        CreateMap<PlanEntry, PlanHierarchyDto>()
            .ForMember(d => d.Level, opt => opt.MapFrom(s => s.Level.ToString()))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.ApprovalStatus, opt => opt.MapFrom(s => s.ApprovalStatus.ToString()));

        CreateMap<PlanIndicatorAllocation, PlanIndicatorAllocationDto>();
        CreateMap<PlanActivity, PlanActivityDto>();
        CreateMap<DipItem, DipItemDto>()
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()));
        CreateMap<DipMilestone, DipMilestoneDto>();
        CreateMap<PlanningConfiguration, PlanningConfigurationDto>();
    }
}
