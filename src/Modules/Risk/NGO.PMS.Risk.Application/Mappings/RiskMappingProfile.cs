using AutoMapper;
using NGO.PMS.Risk.Application.DTOs;
using NGO.PMS.Risk.Domain.Entities;

namespace NGO.PMS.Risk.Application.Mappings;

public class RiskMappingProfile : Profile
{
    public RiskMappingProfile()
    {
        CreateMap<RiskCategory, RiskCategoryDto>();

        CreateMap<Domain.Entities.Risk, RiskDto>()
            .ForMember(d => d.Likelihood, o => o.MapFrom(s => s.Likelihood.ToString()))
            .ForMember(d => d.Impact, o => o.MapFrom(s => s.Impact.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.LatestAssessment, o => o.MapFrom(s =>
                s.Assessments.OrderByDescending(a => a.AssessmentDate).FirstOrDefault()));

        CreateMap<RiskMitigation, RiskMitigationDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<RiskAssessment, RiskAssessmentDto>()
            .ForMember(d => d.Likelihood, o => o.MapFrom(s => s.Likelihood.ToString()))
            .ForMember(d => d.Impact, o => o.MapFrom(s => s.Impact.ToString()));
    }
}
