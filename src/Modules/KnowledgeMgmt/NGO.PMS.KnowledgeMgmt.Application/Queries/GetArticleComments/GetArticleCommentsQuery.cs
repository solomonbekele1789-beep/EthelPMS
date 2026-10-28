using MediatR;
using NGO.PMS.KnowledgeMgmt.Application.DTOs;

namespace NGO.PMS.KnowledgeMgmt.Application.Queries.GetArticleComments;

public sealed record GetArticleCommentsQuery(Guid ArticleId) : IRequest<List<KbArticleCommentDto>>;
