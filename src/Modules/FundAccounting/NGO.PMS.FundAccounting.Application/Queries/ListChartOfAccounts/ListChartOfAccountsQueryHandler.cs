using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.FundAccounting.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Application.Queries.ListChartOfAccounts;

public sealed class ListChartOfAccountsQueryHandler
    : IRequestHandler<ListChartOfAccountsQuery, List<ChartOfAccountDto>>
{
    private readonly IFundAccountingDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListChartOfAccountsQueryHandler(
        IFundAccountingDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<ChartOfAccountDto>> Handle(
        ListChartOfAccountsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _db.ChartOfAccounts
            .AsNoTracking()
            .Where(x => x.OrganizationId == _currentUser.OrganizationId);

        if (request.AccountType.HasValue)
            query = query.Where(x => x.AccountType == request.AccountType.Value);

        if (request.IsActive.HasValue)
            query = query.Where(x => x.IsActive == request.IsActive.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(x =>
                x.AccountCode.Contains(request.Search) ||
                x.AccountName.Contains(request.Search));

        var accounts = await query
            .Join(
                _db.AccountCategories.AsNoTracking(),
                a => a.AccountCategoryId,
                c => c.Id,
                (a, c) => new ChartOfAccountDto
                {
                    Id = a.Id,
                    AccountCode = a.AccountCode,
                    AccountName = a.AccountName,
                    AccountType = a.AccountType.ToString(),
                    AccountCategoryId = a.AccountCategoryId,
                    CategoryName = c.Name,
                    Description = a.Description,
                    IsActive = a.IsActive,
                    IsSystemAccount = a.IsSystemAccount
                })
            .OrderBy(x => x.AccountCode)
            .ToListAsync(cancellationToken);

        return accounts;
    }
}
