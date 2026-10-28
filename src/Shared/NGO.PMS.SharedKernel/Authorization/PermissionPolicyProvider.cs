using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace NGO.PMS.SharedKernel.Authorization;

/// <summary>
/// Dynamic policy provider that creates authorization policies on-the-fly
/// for permission strings (format: {module}.{resource}.{action}).
/// Named policies without dots (e.g., "SuperAdmin") fall through to the default provider.
/// </summary>
public class PermissionPolicyProvider : IAuthorizationPolicyProvider
{
    private readonly DefaultAuthorizationPolicyProvider _fallback;

    public PermissionPolicyProvider(IOptions<AuthorizationOptions> options)
        => _fallback = new DefaultAuthorizationPolicyProvider(options);

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        // Permission codes contain dots: "identity.users.read"
        // Named policies don't: "SuperAdmin"
        if (policyName.Contains('.'))
        {
            var policy = new AuthorizationPolicyBuilder()
                .AddRequirements(new PermissionRequirement(policyName))
                .Build();
            return Task.FromResult<AuthorizationPolicy?>(policy);
        }

        return _fallback.GetPolicyAsync(policyName);
    }

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync()
        => _fallback.GetDefaultPolicyAsync();

    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync()
        => _fallback.GetFallbackPolicyAsync();
}
