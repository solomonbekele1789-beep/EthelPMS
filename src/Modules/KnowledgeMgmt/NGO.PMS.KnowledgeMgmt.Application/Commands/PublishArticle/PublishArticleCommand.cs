using MediatR;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.PublishArticle;

public sealed record PublishArticleCommand(Guid Id) : IRequest<Unit>;
