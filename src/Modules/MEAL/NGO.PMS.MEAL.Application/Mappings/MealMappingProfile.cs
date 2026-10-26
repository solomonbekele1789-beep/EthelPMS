using AutoMapper;
using NGO.PMS.MEAL.Application.DTOs;
using NGO.PMS.MEAL.Domain.Entities;

namespace NGO.PMS.MEAL.Application.Mappings;

public class MealMappingProfile : Profile
{
    public MealMappingProfile()
    {
        CreateMap<MealPlan, MealPlanDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<MealIndicator, MealIndicatorDto>()
            .ForMember(d => d.Level, o => o.MapFrom(s => s.Level.ToString()))
            .ForMember(d => d.CollectionFrequency, o => o.MapFrom(s => s.CollectionFrequency.ToString()));

        CreateMap<IndicatorMeasurement, IndicatorMeasurementDto>();

        CreateMap<Evaluation, EvaluationDto>()
            .ForMember(d => d.EvaluationType, o => o.MapFrom(s => s.EvaluationType.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.PrimaryDacCriteria, o => o.MapFrom(s => s.PrimaryDacCriteria != null ? s.PrimaryDacCriteria.ToString() : null));

        CreateMap<EvaluationFinding, EvaluationFindingDto>()
            .ForMember(d => d.DacCriteria, o => o.MapFrom(s => s.DacCriteria != null ? s.DacCriteria.ToString() : null))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<GesiAssessment, GesiAssessmentDto>();

        CreateMap<LessonLearned, LessonLearnedDto>();
    }
}
