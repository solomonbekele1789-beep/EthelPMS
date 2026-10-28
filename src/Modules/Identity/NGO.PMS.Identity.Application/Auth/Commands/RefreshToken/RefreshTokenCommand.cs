using MediatR;
using NGO.PMS.Identity.Application.Auth.Commands.Login;

namespace NGO.PMS.Identity.Application.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<LoginResponse>;
