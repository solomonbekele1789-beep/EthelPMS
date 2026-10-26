using MediatR;
using NGO.PMS.Identity.Application.Users.DTOs;

namespace NGO.PMS.Identity.Application.Users.Queries.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<CurrentUserDto>;
