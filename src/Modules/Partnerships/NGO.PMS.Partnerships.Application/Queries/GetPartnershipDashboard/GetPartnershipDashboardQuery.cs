using MediatR;
using NGO.PMS.Partnerships.Application.DTOs;

namespace NGO.PMS.Partnerships.Application.Queries.GetPartnershipDashboard;

public sealed record GetPartnershipDashboardQuery() : IRequest<PartnershipDashboardDto>;
