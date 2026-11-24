using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.SharedKernel.Persistence;

/// <summary>
/// Base DbContext for all tenant-scoped modules.
/// Enforces global query filters for multi-tenancy (IMultiTenant.TenantId or OrganizationId)
/// and soft-delete (ISoftDeletable), maps outbox.inbox_messages, and auto-sets/protects
/// tenant IDs on SaveChangesAsync.
/// </summary>
public abstract class MultiTenantDbContext : DbContext
{
    private readonly ICurrentUserService _currentUser;

    /// <summary>
    /// Exposed for EF Core parameterized global query filter evaluation per-request.
    /// </summary>
    protected Guid CurrentOrganizationId => _currentUser.OrganizationId;

    protected MultiTenantDbContext(
        DbContextOptions options,
        ICurrentUserService currentUser)
        : base(options)
    {
        _currentUser = currentUser;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<InboxMessage>(b =>
        {
            b.ToTable("inbox_messages", "outbox", t => t.ExcludeFromMigrations());
            b.HasKey(x => new { x.Id, x.ConsumerName });
        });

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var clrType = entityType.ClrType;
            if (clrType == typeof(OutboxMessage) || clrType == typeof(InboxMessage))
                continue;

            var isSoftDeletable = typeof(ISoftDeletable).IsAssignableFrom(clrType);
            var tenantPropName = GetTenantPropertyName(clrType);

            if (!isSoftDeletable && tenantPropName is null)
                continue;

            var parameter = Expression.Parameter(clrType, "e");
            Expression? combined = null;

            if (isSoftDeletable)
            {
                var isDeletedProp = Expression.Property(parameter, nameof(ISoftDeletable.IsDeleted));
                combined = Expression.Equal(isDeletedProp, Expression.Constant(false));
            }

            if (tenantPropName is not null)
            {
                var tenantProp = Expression.Property(parameter, tenantPropName);
                var currentOrgExpr = Expression.Property(Expression.Constant(this), nameof(CurrentOrganizationId));
                var emptyGuid = Expression.Constant(Guid.Empty);
                var tenantCondition = Expression.OrElse(
                    Expression.Equal(currentOrgExpr, emptyGuid),
                    Expression.Equal(tenantProp, currentOrgExpr));

                combined = combined is null ? tenantCondition : Expression.AndAlso(combined, tenantCondition);
            }

            if (combined is not null)
            {
                modelBuilder.Entity(clrType).HasQueryFilter(Expression.Lambda(combined, parameter));
            }
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var currentOrgId = _currentUser.OrganizationId;

        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is OutboxMessage or InboxMessage)
                continue;

            var tenantPropName = GetTenantPropertyName(entry.Entity.GetType());
            if (tenantPropName is null)
                continue;

            var prop = entry.Property(tenantPropName);
            if (entry.State == EntityState.Added &&
                prop.CurrentValue is Guid val &&
                val == Guid.Empty &&
                currentOrgId != Guid.Empty)
            {
                prop.CurrentValue = currentOrgId;
            }
            else if (entry.State == EntityState.Modified)
            {
                prop.IsModified = false;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    private static string? GetTenantPropertyName(Type clrType)
    {
        if (typeof(IMultiTenant).IsAssignableFrom(clrType))
            return nameof(IMultiTenant.TenantId);

        var orgProp = clrType.GetProperty("OrganizationId");
        if (orgProp is not null && orgProp.PropertyType == typeof(Guid))
            return "OrganizationId";

        return null;
    }
}
