using MediatR;
using NGO.PMS.Partnerships.Application.DTOs;
using NGO.PMS.Partnerships.Domain.Enums;

namespace NGO.PMS.Partnerships.Application.Queries.GetSubGrantees;

public sealed record GetSubGranteesQuery(PartnerStatus? Status, PartnerType? PartnerType) : IRequest<List<SubGranteeListDto>>;
