using MediatR;
using NGO.PMS.Identity.Application.Offices.DTOs;

namespace NGO.PMS.Identity.Application.Offices.Queries.GetOffice;

public record GetOfficeQuery(Guid Id) : IRequest<OfficeDto>;
