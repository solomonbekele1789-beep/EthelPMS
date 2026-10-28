using MediatR;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.DeleteArticle;

public sealed record DeleteArticleCommand(Guid Id) : IRequest<Unit>;
