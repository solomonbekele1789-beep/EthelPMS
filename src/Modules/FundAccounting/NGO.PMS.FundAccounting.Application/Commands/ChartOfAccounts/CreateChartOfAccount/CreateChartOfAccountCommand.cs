using MediatR;
using NGO.PMS.FundAccounting.Domain.Enums;

namespace NGO.PMS.FundAccounting.Application.Commands.ChartOfAccounts.CreateChartOfAccount;

public sealed record CreateChartOfAccountCommand(
    string AccountCode,
    string AccountName,
    AccountType AccountType,
    Guid AccountCategoryId,
    string? Description) : IRequest<Guid>;
