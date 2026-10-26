using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.FundAccounting.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Application.Queries.ListAccountCategories;

public sealed class ListAccountCategoriesQueryHandler
    : IRequestHandler<ListAccountCategoriesQuery, List<AccountCategoryDto>>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public ListAccountCategoriesQueryHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _db = db;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<List<AccountCategoryDto>> Handle(
        ListAccountCategoriesQuery request,
        CancellationToken cancellationToken)
    {
        var categories = await _db.AccountCategories
            .AsNoTracking()
            .Where(x => x.OrganizationId == _currentUser.OrganizationId)
            .Include(x => x.SubCategories)
            .Where(x => x.ParentCategoryId == null)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<AccountCategoryDto>>(categories);
    }
}
