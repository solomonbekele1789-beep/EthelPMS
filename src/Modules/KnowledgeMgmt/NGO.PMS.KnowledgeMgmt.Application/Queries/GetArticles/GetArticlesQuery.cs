using MediatR;
using NGO.PMS.KnowledgeMgmt.Application.DTOs;
using NGO.PMS.KnowledgeMgmt.Domain.Enums;

namespace NGO.PMS.KnowledgeMgmt.Application.Queries.GetArticles;

public sealed record GetArticlesQuery(
    Guid? CategoryId,
    ArticleType? ArticleType,
    ArticleStatus? Status,
    string? SearchTerm,
    string? Tags) : IRequest<List<KbArticleListDto>>;
