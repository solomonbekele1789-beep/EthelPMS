using MediatR;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using NGO.PMS.Identity.Application.Auth.Commands.ForgotPassword;
using NGO.PMS.Identity.Application.Auth.Commands.Login;
using NGO.PMS.Identity.Application.Auth.Commands.Logout;
using NGO.PMS.Identity.Application.Auth.Commands.RefreshToken;
using NGO.PMS.Identity.Application.Auth.Commands.ResetPassword;
using NGO.PMS.Identity.Application.Auth.Commands.SetupPassword;

namespace NGO.PMS.Identity.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private const string AccessTokenCookie = "__Host-access-token";
    private const string RefreshTokenCookie = "__Host-refresh-token";

    private readonly ISender _mediator;
    private readonly IAntiforgery _antiforgery;

    public AuthController(ISender mediator, IAntiforgery antiforgery)
    {
        _mediator = mediator;
        _antiforgery = antiforgery;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);

        if (IsMobileClient())
        {
            return Ok(result);
        }

        SetAuthCookies(result.AccessToken, result.RefreshToken, result.ExpiresIn);
        return Ok(new
        {
            accessToken = result.AccessToken,
            refreshToken = result.RefreshToken,
            expiresIn = result.ExpiresIn,
            user = result.User
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutCommand? command, CancellationToken ct)
    {
        var refreshToken = command?.RefreshToken
            ?? Request.Cookies[RefreshTokenCookie]
            ?? string.Empty;

        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            await _mediator.Send(new LogoutCommand(refreshToken), ct);
        }

        ClearAuthCookies();
        return Ok(new { success = true, message = "Logged out successfully." });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand? command, CancellationToken ct)
    {
        var token = command?.RefreshToken ?? Request.Cookies[RefreshTokenCookie] ?? string.Empty;
        var result = await _mediator.Send(new RefreshTokenCommand(token), ct);

        if (!IsMobileClient())
        {
            SetAuthCookies(result.AccessToken, result.RefreshToken, result.ExpiresIn);
        }

        return Ok(result);
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return Ok(new { success = true, message = "If the email exists, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return Ok(new { success = true, message = "Password has been reset successfully." });
    }

    [HttpPost("setup-password")]
    [AllowAnonymous]
    public async Task<IActionResult> SetupPassword([FromBody] SetupPasswordCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return Ok(new { success = true, message = "Password has been set up successfully." });
    }

    private bool IsMobileClient() =>
        string.Equals(Request.Headers["X-Client-Type"].ToString(), "mobile", StringComparison.OrdinalIgnoreCase);

    private void SetAuthCookies(string accessToken, string refreshToken, int expiresInSeconds)
    {
        var isHttps = Request.IsHttps;

        Response.Cookies.Append(AccessTokenCookie, accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = isHttps,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddSeconds(expiresInSeconds)
        });

        Response.Cookies.Append(RefreshTokenCookie, refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = isHttps,
            SameSite = SameSiteMode.Strict,
            Path = "/api/v1/auth",
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

        var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
        if (!string.IsNullOrEmpty(tokens.RequestToken))
        {
            Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken, new CookieOptions
            {
                HttpOnly = false,
                Secure = isHttps,
                SameSite = SameSiteMode.Strict,
                Path = "/"
            });
        }
    }

    private void ClearAuthCookies()
    {
        Response.Cookies.Delete(AccessTokenCookie, new CookieOptions { Path = "/" });
        Response.Cookies.Delete(RefreshTokenCookie, new CookieOptions { Path = "/api/v1/auth" });
        Response.Cookies.Delete("XSRF-TOKEN", new CookieOptions { Path = "/" });
    }
}
