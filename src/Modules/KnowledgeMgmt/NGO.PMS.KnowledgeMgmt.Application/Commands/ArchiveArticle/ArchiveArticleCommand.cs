using MediatR;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.ArchiveArticle;

public sealed record ArchiveArticleCommand(Guid Id) : IRequest<Unit>;
