using MediatR;
using NGO.PMS.Identity.Application.Users.DTOs;

namespace NGO.PMS.Identity.Application.Users.Queries.GetUser;

public record GetUserQuery(Guid Id) : IRequest<UserDto>;
