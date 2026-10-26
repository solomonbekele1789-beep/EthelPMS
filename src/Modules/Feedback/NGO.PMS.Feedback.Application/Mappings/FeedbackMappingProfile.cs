using AutoMapper;
using NGO.PMS.Feedback.Application.DTOs;
using NGO.PMS.Feedback.Domain.Entities;

namespace NGO.PMS.Feedback.Application.Mappings;

public class FeedbackMappingProfile : Profile
{
    public FeedbackMappingProfile()
    {
        CreateMap<FeedbackCategory, FeedbackCategoryDto>();

        CreateMap<FeedbackItem, FeedbackItemDto>()
            .ForMember(d => d.SlaStatus, o => o.MapFrom(s => s.ComputeSlaStatus()))
            .ForMember(d => d.ResponseCount, o => o.MapFrom(s => s.Responses.Count))
            .ForMember(d => d.Responses, o => o.MapFrom(s => s.Responses));

        CreateMap<FeedbackResponse, FeedbackResponseDto>();
    }
}
