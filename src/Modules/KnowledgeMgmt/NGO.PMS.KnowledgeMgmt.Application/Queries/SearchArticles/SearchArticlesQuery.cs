using MediatR;
using NGO.PMS.KnowledgeMgmt.Application.DTOs;

namespace NGO.PMS.KnowledgeMgmt.Application.Queries.SearchArticles;

public sealed record SearchArticlesQuery(string SearchTerm) : IRequest<List<KbArticleListDto>>;
