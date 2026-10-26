using MediatR;
using NGO.PMS.Donors.Application.DTOs;

namespace NGO.PMS.Donors.Application.Queries.GetComplianceDashboard;

public sealed record GetComplianceDashboardQuery() : IRequest<List<ComplianceDashboardDto>>;
