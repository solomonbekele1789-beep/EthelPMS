using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Risk.Application.Abstractions;
using NGO.PMS.Risk.Application.DTOs;

namespace NGO.PMS.Risk.Application.RiskCategories.Queries.ListRiskCategories;

public class ListRiskCategoriesQueryHandler : IRequestHandler<ListRiskCategoriesQuery, List<RiskCategoryDto>>
{
    private readonly IRiskDbContext _db;
    private readonly IMapper _mapper;

    public ListRiskCategoriesQueryHandler(IRiskDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<RiskCategoryDto>> Handle(ListRiskCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await _db.RiskCategories
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ProjectTo<RiskCategoryDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
