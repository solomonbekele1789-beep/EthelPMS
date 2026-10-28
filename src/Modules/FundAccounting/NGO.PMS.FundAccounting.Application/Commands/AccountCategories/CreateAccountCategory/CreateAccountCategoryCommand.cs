using MediatR;
using NGO.PMS.FundAccounting.Domain.Enums;

namespace NGO.PMS.FundAccounting.Application.Commands.AccountCategories.CreateAccountCategory;

public sealed record CreateAccountCategoryCommand(
    string Code,
    string Name,
    AccountType AccountType,
    int SortOrder,
    Guid? ParentCategoryId) : IRequest<Guid>;
