using MediatR;
using NGO.PMS.Identity.Application.Users.DTOs;
using NGO.PMS.SharedKernel.Api;

namespace NGO.PMS.Identity.Application.Users.Queries.ListUsers;

public record ListUsersQuery(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    Guid? OfficeId = null,
    bool? IsActive = null) : IRequest<PagedResponse<UserListItemDto>>;
