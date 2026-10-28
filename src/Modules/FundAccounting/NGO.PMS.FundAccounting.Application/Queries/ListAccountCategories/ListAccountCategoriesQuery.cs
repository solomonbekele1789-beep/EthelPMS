using MediatR;
using NGO.PMS.FundAccounting.Application.DTOs;

namespace NGO.PMS.FundAccounting.Application.Queries.ListAccountCategories;

public sealed record ListAccountCategoriesQuery() : IRequest<List<AccountCategoryDto>>;
