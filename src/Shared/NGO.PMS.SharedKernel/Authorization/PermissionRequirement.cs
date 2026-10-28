using Microsoft.AspNetCore.Authorization;

namespace NGO.PMS.SharedKernel.Authorization;

/// <summary>
/// ASP.NET Core authorization requirement for a specific permission code.
/// Created dynamically by PermissionPolicyProvider for any permission string.
/// </summary>
public class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }
    public PermissionRequirement(string permission) => Permission = permission;
}
