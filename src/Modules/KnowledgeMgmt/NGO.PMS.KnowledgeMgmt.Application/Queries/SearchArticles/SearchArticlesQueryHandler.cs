using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.KnowledgeMgmt.Application.DTOs;

namespace NGO.PMS.KnowledgeMgmt.Application.Queries.SearchArticles;

public sealed class SearchArticlesQueryHandler : IRequestHandler<SearchArticlesQuery, List<KbArticleListDto>>
{
    private readonly IKnowledgeMgmtDbContext _db;
    private readonly IMapper _mapper;

    public SearchArticlesQueryHandler(IKnowledgeMgmtDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<KbArticleListDto>> Handle(SearchArticlesQuery request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.SearchTerm))
            return [];

        var term = request.SearchTerm;

        return await _db.KbArticles
            .AsNoTracking()
            .Include(a => a.Category)
            .Where(a => a.Title.Contains(term) ||
                a.Content.Contains(term) ||
                a.Tags.Contains(term))
            .OrderByDescending(a => a.CreatedAt)
            .ProjectTo<KbArticleListDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
