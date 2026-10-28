using MediatR;
using NGO.PMS.Projects.Application.DTOs;

namespace NGO.PMS.Projects.Application.InterventionAreas.Queries.ListInterventionAreas;

public record ListInterventionAreasQuery : IRequest<List<InterventionAreaDto>>;
