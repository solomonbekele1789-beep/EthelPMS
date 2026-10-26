using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Identity.Application;

/// <summary>
/// Abstraction over IdentityDbContext for testability.
/// Implemented by Infrastructure.Persistence.IdentityDbContext.
/// </summary>
public interface IIdentityDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<PasswordResetToken> PasswordResetTokens { get; }
    DbSet<Organization> Organizations { get; }
    DbSet<Office> Offices { get; }
    DbSet<Location> Locations { get; }
    DbSet<AttributeRule> AttributeRules { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
