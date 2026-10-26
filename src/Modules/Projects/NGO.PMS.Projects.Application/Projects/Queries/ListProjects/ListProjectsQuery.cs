using MediatR;
using NGO.PMS.Projects.Application.Common;
using NGO.PMS.Projects.Application.DTOs;

namespace NGO.PMS.Projects.Application.Projects.Queries.ListProjects;

public record ListProjectsQuery(
    int Page,
    int PageSize,
    string? Search,
    string? Status) : IRequest<PagedResult<ProjectListItemDto>>;
