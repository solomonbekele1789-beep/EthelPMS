using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace NGO.PMS.SharedKernel.Authorization;

/// <summary>
/// Handles PermissionRequirement using Hybrid RBAC + ABAC:
/// 1. SuperAdmin role has platform-wide access.
/// 2. Checks JWT 'permissions' claims (fast path).
/// 3. Falls back to database lookup via IPermissionService (handles perm_hash and mid-session changes).
/// 4. Evaluates ABAC attribute rules when resource context is supplied.
/// Note: Organization Admin does NOT bypass RBAC or gain platform.* access.
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

        var roles = context.User.FindAll("roles").Select(c => c.Value).ToList();

        // Only platform-level SuperAdmin bypasses granular checks
        if (roles.Contains("SuperAdmin", StringComparer.Ordinal))
        {
            context.Succeed(requirement);
            return;
        }

        // Non-SuperAdmin users can never access platform.* permissions
        if (requirement.Permission.StartsWith("platform.", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        // 1. Check JWT claims first (fast path — when <= 20 permissions are embedded)
        var permissionClaims = context.User.FindAll("permissions")
            .Select(c => c.Value).ToList();

        var hasRbacPermission = permissionClaims.Count > 0 &&
                                permissionClaims.Contains(requirement.Permission, StringComparer.Ordinal);

        // 2. Fallback to DB check (handles perm_hash or mid-session permission changes)
        if (!hasRbacPermission && Guid.TryParse(userId, out var uidForCheck))
        {
            hasRbacPermission = await _permissionService.HasPermissionAsync(uidForCheck, requirement.Permission);
        }

        if (!hasRbacPermission) return;

        // 3. ABAC attribute rule check (when resource context dictionary is provided)
        if (context.Resource is Dictionary<string, object> abacContext &&
            Guid.TryParse(userId, out var uidForAbac))
        {
            var abacPassed = await _permissionService.EvaluateAttributeRulesAsync(
                uidForAbac, requirement.Permission, abacContext);
            if (!abacPassed) return;
        }

        context.Succeed(requirement);
    }
}
