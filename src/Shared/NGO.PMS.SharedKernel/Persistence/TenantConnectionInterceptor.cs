using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.SharedKernel.Persistence;

/// <summary>
/// Sets the PostgreSQL session variable 'app.current_org_id' on each connection open.
/// This enables Row Level Security (RLS) policies to filter data by tenant.
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
            command.CommandText = $"SET app.current_org_id = '{_currentUser.OrganizationId}'";
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        await base.ConnectionOpenedAsync(connection, eventData, cancellationToken);
    }
}
