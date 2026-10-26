using MediatR;
using NGO.PMS.Partnerships.Application.DTOs;

namespace NGO.PMS.Partnerships.Application.Queries.GetSubGranteeById;

public sealed record GetSubGranteeByIdQuery(Guid Id) : IRequest<SubGranteeDto>;
