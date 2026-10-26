using MediatR;
using NGO.PMS.Training.Application.DTOs;

namespace NGO.PMS.Training.Application.Queries.ListTrainers;

public sealed record ListTrainersQuery(
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<TrainerDto>>;
