using MediatR;

namespace NGO.PMS.Identity.Application.Auth.Commands.Logout;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly IJwtTokenService _jwtService;

    public LogoutCommandHandler(IJwtTokenService jwtService) => _jwtService = jwtService;

    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        await _jwtService.RevokeRefreshTokenAsync(request.RefreshToken, cancellationToken);
    }
}
