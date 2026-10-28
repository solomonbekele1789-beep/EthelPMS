using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Identity.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUserService(IHttpContextAccessor accessor) => _accessor = accessor;

    public Guid UserId => Guid.TryParse(
        _accessor.HttpContext?.User.FindFirstValue("sub"), out var id) ? id : Guid.Empty;

    public Guid OrganizationId => Guid.TryParse(
        _accessor.HttpContext?.User.FindFirstValue("tenant_id"), out var id) ? id : Guid.Empty;

    public string Email =>
        _accessor.HttpContext?.User.FindFirstValue("email") ?? string.Empty;

    public string FullName =>
        _accessor.HttpContext?.User.FindFirstValue("name") ?? string.Empty;

    public IReadOnlyList<string> Permissions =>
        _accessor.HttpContext?.User.FindAll("permissions").Select(c => c.Value).ToList()
        ?? [];

    public IReadOnlyList<string> Roles =>
        _accessor.HttpContext?.User.FindAll("roles").Select(c => c.Value).ToList()
        ?? [];

    public bool IsAuthenticated =>
        _accessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
}
