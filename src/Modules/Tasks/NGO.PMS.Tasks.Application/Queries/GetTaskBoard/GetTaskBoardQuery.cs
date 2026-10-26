using MediatR;
using NGO.PMS.Tasks.Application.DTOs;

namespace NGO.PMS.Tasks.Application.Queries.GetTaskBoard;

public sealed record GetTaskBoardQuery(Guid BoardId) : IRequest<TaskBoardDto>;
