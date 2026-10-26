using MediatR;
using NGO.PMS.Identity.Application.Organizations.DTOs;

namespace NGO.PMS.Identity.Application.Organizations.Queries.GetOrganization;

public record GetOrganizationQuery : IRequest<OrganizationDto>;
