namespace NGO.PMS.SharedKernel.Authorization;

/// <summary>
/// Provides permission and role lookups for authorization decisions.
/// Implemented by the Identity module using Dapper for fast reads.
/// </summary>
public interface IPermissionService
{
    Task<bool> HasPermissionAsync(Guid userId, string permissionCode, CancellationToken ct = default);
    Task<IReadOnlyList<string>> GetUserPermissionsAsync(Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<string>> GetUserRolesAsync(Guid userId, CancellationToken ct = default);
    Task<bool> EvaluateAttributeRulesAsync(Guid userId, string permissionCode,
        Dictionary<string, object> context, CancellationToken ct = default);
}
