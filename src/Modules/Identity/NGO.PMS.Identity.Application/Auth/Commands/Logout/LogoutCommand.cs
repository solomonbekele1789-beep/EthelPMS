using MediatR;

namespace NGO.PMS.Identity.Application.Auth.Commands.Logout;

public record LogoutCommand(string RefreshToken) : IRequest;
