using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application;
using NGO.PMS.Identity.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Identity.Infrastructure.Persistence;

public class IdentityDbContext : MultiTenantDbContext, IIdentityDbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Office> Offices => Set<Office>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<AttributeRule> AttributeRules => Set<AttributeRule>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public IdentityDbContext(
        DbContextOptions<IdentityDbContext> options,
        ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema("identity");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(IdentityDbContext).Assembly);
    }
}
