using Microsoft.AspNetCore.Authorization;

namespace NGO.PMS.SharedKernel.Authorization;

/// <summary>
/// Declarative attribute to require a specific permission for accessing an endpoint.
/// Works with PermissionPolicyProvider which creates dynamic authorization policies.
/// Usage: [RequirePermission("identity.users.read")]
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RequirePermissionAttribute : AuthorizeAttribute
{
    public RequirePermissionAttribute(string permission)
        : base(policy: permission) { }
}
