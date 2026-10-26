using MediatR;
using NGO.PMS.Training.Application.DTOs;
using NGO.PMS.Training.Domain.Enums;

namespace NGO.PMS.Training.Application.Queries.ListTrainingSessions;

public sealed record ListTrainingSessionsQuery(
    Guid? ProgramId,
    TrainingStatus? Status,
    DateTime? FromDate,
    DateTime? ToDate,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<TrainingSessionDto>>;
