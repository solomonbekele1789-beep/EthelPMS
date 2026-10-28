using MediatR;
using NGO.PMS.Partnerships.Application.DTOs;

namespace NGO.PMS.Partnerships.Application.Queries.GetPartnerReportById;

public sealed record GetPartnerReportByIdQuery(Guid Id) : IRequest<PartnerReportDto>;
