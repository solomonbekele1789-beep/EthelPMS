using MediatR;
using NGO.PMS.Partnerships.Application.DTOs;

namespace NGO.PMS.Partnerships.Application.Queries.GetComplianceChecks;

public sealed record GetComplianceChecksQuery(Guid? SubGranteeId) : IRequest<List<PartnerComplianceDto>>;
