using MediatR;
using NGO.PMS.Partnerships.Application.DTOs;

namespace NGO.PMS.Partnerships.Application.Queries.GetDisbursements;

public sealed record GetDisbursementsQuery(Guid? SubGranteeId) : IRequest<List<DisbursementDto>>;
