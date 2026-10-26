using MediatR;
using NGO.PMS.Risk.Application.DTOs;

namespace NGO.PMS.Risk.Application.RiskCategories.Queries.ListRiskCategories;

public sealed record ListRiskCategoriesQuery() : IRequest<List<RiskCategoryDto>>;
