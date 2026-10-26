using MediatR;
using NGO.PMS.FundAccounting.Application.DTOs;

namespace NGO.PMS.FundAccounting.Application.Queries.GetBudget;

public sealed record GetBudgetQuery(Guid BudgetId) : IRequest<BudgetDto>;
