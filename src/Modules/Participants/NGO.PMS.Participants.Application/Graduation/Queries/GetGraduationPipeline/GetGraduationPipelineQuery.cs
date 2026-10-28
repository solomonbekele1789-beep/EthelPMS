using MediatR;
using NGO.PMS.Participants.Application.DTOs;

namespace NGO.PMS.Participants.Application.Graduation.Queries.GetGraduationPipeline;

public sealed record GetGraduationPipelineQuery(Guid ProjectId) : IRequest<GraduationPipelineDto>;
