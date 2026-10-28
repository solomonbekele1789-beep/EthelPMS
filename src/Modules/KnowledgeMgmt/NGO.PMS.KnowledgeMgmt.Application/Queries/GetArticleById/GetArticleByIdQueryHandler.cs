using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.KnowledgeMgmt.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.KnowledgeMgmt.Application.Queries.GetArticleById;

public sealed class GetArticleByIdQueryHandler : IRequestHandler<GetArticleByIdQuery, KbArticleDto>
{
    private readonly IKnowledgeMgmtDbContext _db;
    private readonly IMapper _mapper;

    public GetArticleByIdQueryHandler(IKnowledgeMgmtDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<KbArticleDto> Handle(GetArticleByIdQuery request, CancellationToken ct)
    {
        var article = await _db.KbArticles
            .AsNoTracking()
            .Include(a => a.Category)
            .FirstOrDefaultAsync(a => a.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.KbArticle), request.Id);

        return _mapper.Map<KbArticleDto>(article);
    }
}
