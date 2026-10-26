using MediatR;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.UpdateArticle;

public sealed record UpdateArticleCommand(
    Guid Id,
    Guid CategoryId,
    string Title,
    string Content,
    string? Summary,
    string? Tags,
    bool? IsFeatured) : IRequest<Unit>;
