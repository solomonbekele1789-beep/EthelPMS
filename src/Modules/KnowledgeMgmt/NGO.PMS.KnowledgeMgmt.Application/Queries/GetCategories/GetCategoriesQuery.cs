using MediatR;
using NGO.PMS.KnowledgeMgmt.Application.DTOs;

namespace NGO.PMS.KnowledgeMgmt.Application.Queries.GetCategories;

public sealed record GetCategoriesQuery() : IRequest<List<KbCategoryDto>>;
