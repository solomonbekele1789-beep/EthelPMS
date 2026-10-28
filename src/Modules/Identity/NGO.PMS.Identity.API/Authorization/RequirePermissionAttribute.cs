using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace NGO.PMS.Identity.API.Authorization;

/// <summary>
/// Authorization filter that checks if the current user has the specified permission claim.
/// Usage: [RequirePermission("identity.users.read")]
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
public class RequirePermissionAttribute : TypeFilterAttribute
{
    public RequirePermissionAttribute(string permission)
        : base(typeof(PermissionAuthorizationFilter))
    {
        Arguments = [permission];
    }
}

/// <summary>
/// Actual filter that runs the permission check.
/// Resolved by DI via TypeFilterAttribute.
/// </summary>
public class PermissionAuthorizationFilter : IAuthorizationFilter
{
    private readonly string _permission;

    public PermissionAuthorizationFilter(string permission) => _permission = permission;

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;

        if (user.Identity is not { IsAuthenticated: true })
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // Organization Admin bypass — full access to all endpoints
        var roles = user.FindAll("roles").Select(c => c.Value);
        if (roles.Contains("Organization Admin"))
            return;

        var permissions = user.FindAll("permissions").Select(c => c.Value).ToList();
        if (!permissions.Contains(_permission))
        {
            context.Result = new ForbidResult();
        }
    }
}
