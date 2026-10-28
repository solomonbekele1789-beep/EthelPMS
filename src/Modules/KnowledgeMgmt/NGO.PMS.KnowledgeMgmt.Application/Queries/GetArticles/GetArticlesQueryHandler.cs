using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.KnowledgeMgmt.Application.DTOs;

namespace NGO.PMS.KnowledgeMgmt.Application.Queries.GetArticles;

public sealed class GetArticlesQueryHandler : IRequestHandler<GetArticlesQuery, List<KbArticleListDto>>
{
    private readonly IKnowledgeMgmtDbContext _db;
    private readonly IMapper _mapper;

    public GetArticlesQueryHandler(IKnowledgeMgmtDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<KbArticleListDto>> Handle(GetArticlesQuery request, CancellationToken ct)
    {
        var query = _db.KbArticles
            .AsNoTracking()
            .Include(a => a.Category)
            .AsQueryable();

        if (request.CategoryId.HasValue)
            query = query.Where(a => a.CategoryId == request.CategoryId.Value);

        if (request.ArticleType.HasValue)
            query = query.Where(a => a.ArticleType == request.ArticleType.Value);

        if (request.Status.HasValue)
            query = query.Where(a => a.Status == request.Status.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            query = query.Where(a => a.Title.Contains(request.SearchTerm) ||
                (a.Summary != null && a.Summary.Contains(request.SearchTerm)));

        if (!string.IsNullOrWhiteSpace(request.Tags))
            query = query.Where(a => a.Tags.Contains(request.Tags));

        return await query
            .OrderByDescending(a => a.CreatedAt)
            .ProjectTo<KbArticleListDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
