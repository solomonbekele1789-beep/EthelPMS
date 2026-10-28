using MediatR;

namespace NGO.PMS.FundAccounting.Application.Commands.Budgets.CreateBudget;

public sealed record CreateBudgetCommand(
    string Title,
    Guid ProjectId,
    int FiscalYear,
    string CurrencyCode,
    decimal ExchangeRate) : IRequest<Guid>;
