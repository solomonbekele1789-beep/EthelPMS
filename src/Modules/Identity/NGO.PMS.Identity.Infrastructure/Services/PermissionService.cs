using Dapper;
using Microsoft.Extensions.Configuration;
using NGO.PMS.SharedKernel.Authorization;
using Npgsql;

namespace NGO.PMS.Identity.Infrastructure.Services;

/// <summary>
/// Dapper-based permission service for fast RBAC + ABAC authorization reads.
/// </summary>
public class PermissionService : IPermissionService
{
    private readonly string _connectionString;

    public PermissionService(IConfiguration config)
        => _connectionString = config.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

    public async Task<IReadOnlyList<string>> GetUserPermissionsAsync(
        Guid userId, CancellationToken ct = default)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        var sql = """
            SELECT DISTINCT p.code
            FROM identity.user_roles ur
            JOIN identity.role_permissions rp ON rp.role_id = ur.role_id
            JOIN identity.permissions p ON p.id = rp.permission_id
            WHERE ur.user_id = @UserId
            """;
        var result = await conn.QueryAsync<string>(sql, new { UserId = userId });
        return result.ToList().AsReadOnly();
    }

    public async Task<bool> HasPermissionAsync(
        Guid userId, string permissionCode, CancellationToken ct = default)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        var sql = """
            SELECT COUNT(1)
            FROM identity.user_roles ur
            JOIN identity.role_permissions rp ON rp.role_id = ur.role_id
            JOIN identity.permissions p ON p.id = rp.permission_id
            WHERE ur.user_id = @UserId AND p.code = @Code
            """;
        var count = await conn.ExecuteScalarAsync<int>(sql,
            new { UserId = userId, Code = permissionCode });
        return count > 0;
    }

    public async Task<IReadOnlyList<string>> GetUserRolesAsync(
        Guid userId, CancellationToken ct = default)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        var sql = """
            SELECT r.name
            FROM identity.user_roles ur
            JOIN identity.roles r ON r.id = ur.role_id
            WHERE ur.user_id = @UserId
            """;
        var result = await conn.QueryAsync<string>(sql, new { UserId = userId });
        return result.ToList().AsReadOnly();
    }

    public async Task<bool> EvaluateAttributeRulesAsync(
        Guid userId, string permissionCode,
        Dictionary<string, object> context, CancellationToken ct = default)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        var userInfo = await conn.QueryFirstOrDefaultAsync<UserAttributeRow>(
            "SELECT id, organization_id, office_id FROM identity.users WHERE id = @UserId",
            new { UserId = userId });

        if (userInfo is null) return false;

        var sql = """
            SELECT ar.attribute_name, ar.operator, ar.attribute_value
            FROM identity.attribute_rules ar
            JOIN identity.permissions p ON p.id = ar.permission_id
            WHERE p.code = @Code AND ar.organization_id = @OrgId
            """;
        var rules = await conn.QueryAsync<AttributeRuleRow>(sql,
            new { Code = permissionCode, OrgId = userInfo.OrganizationId });

        foreach (var rule in rules)
        {
            var expected = ResolveDynamicValue(rule.AttributeValue, userInfo);
            if (!EvaluateRule(rule.AttributeName, rule.Operator, expected, context))
                return false;
        }
        return true;
    }

    internal static string ResolveDynamicValue(string rawValue, UserAttributeRow user) =>
        rawValue switch
        {
            "{{user.id}}" => user.Id.ToString(),
            "{{user.office_id}}" => user.OfficeId?.ToString() ?? string.Empty,
            "{{user.organization_id}}" => user.OrganizationId.ToString(),
            _ => rawValue
        };

    internal static bool EvaluateRule(
        string attributeName,
        string op,
        string expectedValue,
        Dictionary<string, object> context)
    {
        if (!context.TryGetValue(attributeName, out var value) || value is null) return false;
        var actual = value.ToString() ?? string.Empty;

        return op.ToLowerInvariant() switch
        {
            "eq" or "equals" => string.Equals(actual, expectedValue, StringComparison.OrdinalIgnoreCase),
            "neq" or "not_equals" => !string.Equals(actual, expectedValue, StringComparison.OrdinalIgnoreCase),
            "in" => expectedValue.Split(',', StringSplitOptions.TrimEntries)
                .Contains(actual, StringComparer.OrdinalIgnoreCase),
            "lt" or "less_than" => decimal.TryParse(actual, out var a1) && decimal.TryParse(expectedValue, out var e1) && a1 < e1,
            "lte" or "less_than_or_equal" => decimal.TryParse(actual, out var a2) && decimal.TryParse(expectedValue, out var e2) && a2 <= e2,
            "gt" or "greater_than" => decimal.TryParse(actual, out var a3) && decimal.TryParse(expectedValue, out var e3) && a3 > e3,
            "gte" or "greater_than_or_equal" => decimal.TryParse(actual, out var a4) && decimal.TryParse(expectedValue, out var e4) && a4 >= e4,
            _ => false
        };
    }

    internal record UserAttributeRow(Guid Id, Guid OrganizationId, Guid? OfficeId);
    private record AttributeRuleRow(string AttributeName, string Operator, string AttributeValue);
}
