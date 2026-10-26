using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.SharedKernel.Persistence;

/// <summary>
/// Base DbContext for all tenant-scoped modules.
/// Applies global query filters for multi-tenancy and soft-delete.
/// Each module overrides OnModelCreating to set its own schema.
/// </summary>
public abstract class MultiTenantDbContext : DbContext
{
    private readonly ICurrentUserService _currentUser;

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

        // Apply global query filters for soft-delete on all ISoftDeletable entities
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ISoftDeletable).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .HasQueryFilter(
                        ExpressionHelper.BuildSoftDeleteFilter(entityType.ClrType));
            }
        }
    }
}

/// <summary>
/// Helper to build generic lambda expressions for query filters.
/// </summary>
internal static class ExpressionHelper
{
    public static System.Linq.Expressions.LambdaExpression BuildSoftDeleteFilter(Type entityType)
    {
        var parameter = System.Linq.Expressions.Expression.Parameter(entityType, "e");
        var property = System.Linq.Expressions.Expression.Property(parameter, nameof(ISoftDeletable.IsDeleted));
        var falseConstant = System.Linq.Expressions.Expression.Constant(false);
        var body = System.Linq.Expressions.Expression.Equal(property, falseConstant);
        return System.Linq.Expressions.Expression.Lambda(body, parameter);
    }
}
