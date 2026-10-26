using MediatR;
using NGO.PMS.Training.Application.DTOs;
using NGO.PMS.Training.Domain.Enums;

namespace NGO.PMS.Training.Application.Queries.ListTrainingPrograms;

public sealed record ListTrainingProgramsQuery(
    Guid? ProjectId,
    TrainingCategory? Category,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<TrainingProgramDto>>;
