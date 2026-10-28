using MediatR;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.IncrementViewCount;

public sealed record IncrementViewCountCommand(Guid ArticleId) : IRequest<Unit>;
