using MediatR;
using NGO.PMS.Identity.Application.Offices.DTOs;
using NGO.PMS.SharedKernel.Api;

namespace NGO.PMS.Identity.Application.Offices.Queries.ListOffices;

public record ListOfficesQuery(int Page = 1, int PageSize = 50, string? Search = null) : IRequest<PagedResponse<OfficeListItemDto>>;
