using AutoMapper;
using NGO.PMS.Participants.Application.DTOs;
using NGO.PMS.Participants.Domain.Entities;

namespace NGO.PMS.Participants.Application.Mappings;

public class ParticipantsMappingProfile : Profile
{
    public ParticipantsMappingProfile()
    {
        CreateMap<Participant, ParticipantDto>()
            .ForMember(d => d.Gender, o => o.MapFrom(s => s.Gender.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<Participant, ParticipantListItemDto>()
            .ForMember(d => d.Gender, o => o.MapFrom(s => s.Gender.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<ParticipantEnrollment, ParticipantEnrollmentDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<HouseholdMember, HouseholdMemberDto>();

        CreateMap<ParticipantService, ParticipantServiceDto>();

        CreateMap<GraduationBenchmark, GraduationBenchmarkDto>();

        CreateMap<GraduationAssessment, GraduationAssessmentDto>()
            .ForMember(d => d.PillarStage, o => o.MapFrom(s => s.PillarStage.ToString()));

        CreateMap<GraduationDecision, GraduationDecisionDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));
    }
}
