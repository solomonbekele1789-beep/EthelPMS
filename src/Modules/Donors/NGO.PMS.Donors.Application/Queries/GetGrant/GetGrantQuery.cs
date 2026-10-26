using MediatR;
using NGO.PMS.Donors.Application.DTOs;

namespace NGO.PMS.Donors.Application.Queries.GetGrant;

public sealed record GetGrantQuery(Guid GrantId) : IRequest<GrantDto>;
