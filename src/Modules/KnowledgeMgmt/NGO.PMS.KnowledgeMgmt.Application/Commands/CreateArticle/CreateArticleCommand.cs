using MediatR;
using NGO.PMS.KnowledgeMgmt.Domain.Enums;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.CreateArticle;

public sealed record CreateArticleCommand(
    Guid CategoryId,
    string Title,
    string Content,
    string? Summary,
    string? Tags,
    Guid? LinkedProjectId,
    Guid? LinkedEvaluationId,
    ArticleType ArticleType) : IRequest<Guid>;
