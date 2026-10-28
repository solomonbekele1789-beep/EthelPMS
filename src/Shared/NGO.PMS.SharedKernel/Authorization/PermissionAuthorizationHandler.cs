using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace NGO.PMS.SharedKernel.Authorization;

/// <summary>
/// Handles PermissionRequirement by first checking JWT claims (fast path),
/// then falling back to database lookup via IPermissionService (for mid-session permission changes).
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IPermissionService _permissionService;

    public PermissionAuthorizationHandler(IPermissionService permissionService)
        => _permissionService = permissionService;

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var userId = context.User.FindFirstValue("sub");
        if (userId is null) return;

        // 0. Super admin bypass — Organization Admin role has full access
        var roles = context.User.FindAll("roles").Select(c => c.Value);
        if (roles.Contains("Organization Admin"))
        {
            context.Succeed(requirement);
            return;
        }

        // 1. Check JWT claims first (fast path — permissions embedded in token)
        var permissionClaims = context.User.FindAll("permissions")
            .Select(c => c.Value).ToList();

        if (permissionClaims.Count > 0 && permissionClaims.Contains(requirement.Permission))
        {
            context.Succeed(requirement);
            return;
        }

        // 2. Fallback to DB check (handles permission changes mid-session)
        if (Guid.TryParse(userId, out var uid) &&
            await _permissionService.HasPermissionAsync(uid, requirement.Permission))
        {
            context.Succeed(requirement);
        }
    }
}
