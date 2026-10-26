using Dapper;
using Microsoft.Extensions.Configuration;
using NGO.PMS.SharedKernel.Authorization;
using Npgsql;

namespace NGO.PMS.Identity.Infrastructure.Services;

/// <summary>
/// Dapper-based permission service for fast authorization reads.
/// Bypasses EF Core for performance — direct SQL against the identity schema.
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
        var sql = """
            SELECT ar.attribute_name, ar.operator, ar.attribute_value
            FROM identity.attribute_rules ar
            JOIN identity.permissions p ON p.id = ar.permission_id
            WHERE p.code = @Code AND ar.organization_id = (
                SELECT organization_id FROM identity.users WHERE id = @UserId
            )
            """;
        var rules = await conn.QueryAsync<AttributeRuleRow>(sql,
            new { Code = permissionCode, UserId = userId });

        foreach (var rule in rules)
        {
            if (!EvaluateRule(rule, context)) return false;
        }
        return true;
    }

    private static bool EvaluateRule(AttributeRuleRow rule, Dictionary<string, object> context)
    {
        if (!context.TryGetValue(rule.AttributeName, out var value)) return false;
        return rule.Operator switch
        {
            "equals"       => value.ToString() == rule.AttributeValue,
            "not_equals"   => value.ToString() != rule.AttributeValue,
            "in"           => rule.AttributeValue.Split(',').Contains(value.ToString()),
            "less_than"    => Convert.ToDecimal(value) < Convert.ToDecimal(rule.AttributeValue),
            "greater_than" => Convert.ToDecimal(value) > Convert.ToDecimal(rule.AttributeValue),
            _ => false
        };
    }

    private record AttributeRuleRow(string AttributeName, string Operator, string AttributeValue);
}
