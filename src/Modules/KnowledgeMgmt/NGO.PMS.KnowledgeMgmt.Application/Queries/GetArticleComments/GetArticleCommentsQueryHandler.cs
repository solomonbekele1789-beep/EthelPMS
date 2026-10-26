using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.KnowledgeMgmt.Application.DTOs;

namespace NGO.PMS.KnowledgeMgmt.Application.Queries.GetArticleComments;

public sealed class GetArticleCommentsQueryHandler : IRequestHandler<GetArticleCommentsQuery, List<KbArticleCommentDto>>
{
    private readonly IKnowledgeMgmtDbContext _db;
    private readonly IMapper _mapper;

    public GetArticleCommentsQueryHandler(IKnowledgeMgmtDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<KbArticleCommentDto>> Handle(GetArticleCommentsQuery request, CancellationToken ct)
    {
        return await _db.KbArticleComments
            .AsNoTracking()
            .Where(c => c.ArticleId == request.ArticleId)
            .OrderBy(c => c.CreatedAt)
            .ProjectTo<KbArticleCommentDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
