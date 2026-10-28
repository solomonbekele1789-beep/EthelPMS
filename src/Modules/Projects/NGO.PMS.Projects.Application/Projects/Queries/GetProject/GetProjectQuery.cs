using MediatR;
using NGO.PMS.Projects.Application.DTOs;

namespace NGO.PMS.Projects.Application.Projects.Queries.GetProject;

public record GetProjectQuery(Guid ProjectId) : IRequest<ProjectDto>;
