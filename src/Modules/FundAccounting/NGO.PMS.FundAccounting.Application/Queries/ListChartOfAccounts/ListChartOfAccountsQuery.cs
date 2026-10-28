using MediatR;
using NGO.PMS.FundAccounting.Application.DTOs;
using NGO.PMS.FundAccounting.Domain.Enums;

namespace NGO.PMS.FundAccounting.Application.Queries.ListChartOfAccounts;

public sealed record ListChartOfAccountsQuery(
    AccountType? AccountType,
    string? Search,
    bool? IsActive) : IRequest<List<ChartOfAccountDto>>;
