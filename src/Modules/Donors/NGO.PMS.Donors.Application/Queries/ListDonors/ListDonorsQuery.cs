using MediatR;
using NGO.PMS.Donors.Application.DTOs;

namespace NGO.PMS.Donors.Application.Queries.ListDonors;

public sealed record ListDonorsQuery(
    bool? IsActive,
    string? Search,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<DonorDto>>;
