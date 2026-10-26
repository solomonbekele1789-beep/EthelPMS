using AutoMapper;
using NGO.PMS.Training.Application.DTOs;
using NGO.PMS.Training.Domain.Entities;

namespace NGO.PMS.Training.Application.Mappings;

public class TrainingMappingProfile : Profile
{
    public TrainingMappingProfile()
    {
        CreateMap<TrainingProgram, TrainingProgramDto>()
            .ForMember(d => d.Category, o => o.MapFrom(s => s.Category.ToString()));

        CreateMap<TrainingSession, TrainingSessionDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<TrainingParticipant, TrainingParticipantDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<Trainer, TrainerDto>();

        CreateMap<TrainingMaterial, TrainingMaterialDto>();

        CreateMap<TrainingEvaluation, TrainingEvaluationDto>();
    }
}
