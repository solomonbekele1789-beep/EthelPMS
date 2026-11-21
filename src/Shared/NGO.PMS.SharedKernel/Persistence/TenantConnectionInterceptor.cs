using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.SharedKernel.Persistence;

/// <summary>
/// Sets the PostgreSQL session variable 'app.current_org_id' using parameterized set_config
/// on connection open and resets it on connection close to prevent pooled-connection tenant leakage.
/// </summary>
public class TenantConnectionInterceptor : DbConnectionInterceptor
{
    private readonly ICurrentUserService _currentUser;

    public TenantConnectionInterceptor(ICurrentUserService currentUser)
        => _currentUser = currentUser;

    public override async Task ConnectionOpenedAsync(
        DbConnection connection,
        ConnectionEndEventData eventData,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.IsAuthenticated && _currentUser.OrganizationId != Guid.Empty)
        {
            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT set_config('app.current_org_id', @orgId, false)";
            var param = command.CreateParameter();
            param.ParameterName = "@orgId";
            param.Value = _currentUser.OrganizationId.ToString();
            command.Parameters.Add(param);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        await base.ConnectionOpenedAsync(connection, eventData, cancellationToken);
    }

    public override async Task<InterceptionResult> ConnectionClosingAsync(
        DbConnection connection,
        ConnectionEventData eventData,
        InterceptionResult result)
    {
        try
        {
            if (connection.State == System.Data.ConnectionState.Open)
            {
                await using var command = connection.CreateCommand();
                command.CommandText = "SELECT set_config('app.current_org_id', '', false)";
                await command.ExecuteNonQueryAsync();
            }
        }
        catch
        {
            // Connection may already be broken/closing
        }

        return await base.ConnectionClosingAsync(connection, eventData, result);
    }
}
