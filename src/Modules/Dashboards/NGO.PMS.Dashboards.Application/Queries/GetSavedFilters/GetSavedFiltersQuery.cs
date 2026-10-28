using MediatR;
using NGO.PMS.Dashboards.Application.DTOs;

namespace NGO.PMS.Dashboards.Application.Queries.GetSavedFilters;

public sealed record GetSavedFiltersQuery(string? Module = null) : IRequest<List<SavedFilterDto>>;
