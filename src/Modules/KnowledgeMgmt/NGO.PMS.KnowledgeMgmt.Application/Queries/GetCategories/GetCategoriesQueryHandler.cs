using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.KnowledgeMgmt.Application.DTOs;

namespace NGO.PMS.KnowledgeMgmt.Application.Queries.GetCategories;

public sealed class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, List<KbCategoryDto>>
{
    private readonly IKnowledgeMgmtDbContext _db;
    private readonly IMapper _mapper;

    public GetCategoriesQueryHandler(IKnowledgeMgmtDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<KbCategoryDto>> Handle(GetCategoriesQuery request, CancellationToken ct)
    {
        return await _db.KbCategories
            .AsNoTracking()
            .Include(c => c.ChildCategories)
            .OrderBy(c => c.SortOrder)
            .ProjectTo<KbCategoryDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
