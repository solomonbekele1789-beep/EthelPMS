using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.SharedKernel.Persistence;

/// <summary>
/// Base DbContext for all tenant-scoped modules.
/// Enforces global query filters for multi-tenancy (IMultiTenant) and soft-delete (ISoftDeletable),
/// maps outbox.inbox_messages, and auto-sets/protects OrganizationId on SaveChangesAsync.
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
            b.ToTable("inbox_messages", "outbox");
            b.HasKey(x => new { x.EventId, x.HandlerName });
        });

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var clrType = entityType.ClrType;
            var isSoftDeletable = typeof(ISoftDeletable).IsAssignableFrom(clrType);
            var isMultiTenant = typeof(IMultiTenant).IsAssignableFrom(clrType);

            if (!isSoftDeletable && !isMultiTenant)
                continue;

            var parameter = Expression.Parameter(clrType, "e");
            Expression? combined = null;

            if (isSoftDeletable)
            {
                var isDeletedProp = Expression.Property(parameter, nameof(ISoftDeletable.IsDeleted));
                combined = Expression.Equal(isDeletedProp, Expression.Constant(false));
            }

            if (isMultiTenant)
            {
                var orgIdProp = Expression.Property(parameter, nameof(IMultiTenant.OrganizationId));
                var currentOrgExpr = Expression.Property(Expression.Constant(this), nameof(CurrentOrganizationId));
                var emptyGuid = Expression.Constant(Guid.Empty);
                // Enforce tenant filter whenever an authenticated organization context is present
                var tenantCondition = Expression.OrElse(
                    Expression.Equal(currentOrgExpr, emptyGuid),
                    Expression.Equal(orgIdProp, currentOrgExpr));

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

        foreach (var entry in ChangeTracker.Entries<IMultiTenant>())
        {
            if (entry.State == EntityState.Added &&
                entry.Entity.OrganizationId == Guid.Empty &&
                currentOrgId != Guid.Empty)
            {
                entry.Entity.OrganizationId = currentOrgId;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Property(nameof(IMultiTenant.OrganizationId)).IsModified = false;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
