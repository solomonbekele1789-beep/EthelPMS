using MediatR;
using NGO.PMS.Tasks.Application.DTOs;

namespace NGO.PMS.Tasks.Application.Queries.ListTaskComments;

public sealed record ListTaskCommentsQuery(Guid TaskItemId) : IRequest<List<TaskCommentDto>>;
