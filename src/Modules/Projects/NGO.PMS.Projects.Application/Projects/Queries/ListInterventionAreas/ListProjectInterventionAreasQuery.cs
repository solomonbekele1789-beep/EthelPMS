using MediatR;
using NGO.PMS.Projects.Application.DTOs;

namespace NGO.PMS.Projects.Application.Projects.Queries.ListInterventionAreas;

public record ListProjectInterventionAreasQuery(Guid ProjectId) : IRequest<List<ProjectInterventionAreaDto>>;
