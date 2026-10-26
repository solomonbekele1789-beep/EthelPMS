using MediatR;

namespace NGO.PMS.KnowledgeMgmt.Application.Commands.AddArticleComment;

public sealed record AddArticleCommentCommand(
    Guid ArticleId,
    string Content,
    Guid? ParentCommentId) : IRequest<Guid>;
