using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application;
using NGO.PMS.Identity.Domain.Entities;
using NGO.PMS.Identity.Infrastructure.Persistence;

namespace NGO.PMS.API;

/// <summary>
/// Seeds a default organization, admin user, and role for development/testing.
/// Credentials: admin@ethelams.com / Admin@123
/// </summary>
public static class DevelopmentDataSeeder
{
    private const string AdminEmail = "admin@ethelams.com";
    private const string AdminPassword = "Admin@123";

    public static async Task SeedAsync(IServiceProvider services, ILogger logger)
    {
        try
        {
            var db = services.GetRequiredService<IdentityDbContext>();
            var hasher = services.GetRequiredService<IPasswordHasher>();

            // Check if admin user already exists (IgnoreQueryFilters bypasses soft-delete filter)
            var adminExists = await db.Users
                .IgnoreQueryFilters()
                .AnyAsync(u => u.Email == AdminEmail);

            if (adminExists)
            {
                logger.LogInformation("Admin user {Email} already exists — syncing role permissions", AdminEmail);
                await SyncAdminPermissionsAsync(db, logger);
                return;
            }

            // Log diagnostic info
            var userCount = await db.Users.IgnoreQueryFilters().CountAsync();
            logger.LogInformation("Found {Count} existing users (via EF). Admin not found — seeding...", userCount);

            // Use an explicit transaction so SET LOCAL persists across operations
            await using var transaction = await db.Database.BeginTransactionAsync();

            // Disable RLS for this transaction (requires superuser, falls back gracefully)
            try
            {
                await db.Database.ExecuteSqlRawAsync("SET LOCAL row_security = off");
                logger.LogInformation("RLS disabled for seed transaction");
            }
            catch (Exception ex)
            {
                logger.LogWarning("Could not disable RLS ({Message}) — continuing with SET app.current_org_id", ex.Message);
            }

            // 1. Create or find organization (organizations table has no RLS)
            var org = await db.Set<Organization>().FirstOrDefaultAsync(o => o.Slug == "ethel-demo");
            if (org is null)
            {
                org = Organization.Create("Ethel Demo Organization", "ethel-demo");
                db.Set<Organization>().Add(org);
                await db.SaveChangesAsync();
                logger.LogInformation("Created organization: {OrgName} ({OrgId})", org.Name, org.Id);
            }
            else
            {
                logger.LogInformation("Found existing organization: {OrgName} ({OrgId})", org.Name, org.Id);
            }

            // Set tenant context for RLS-protected inserts
            var orgIdStr = org.Id.ToString();
            await db.Database.ExecuteSqlAsync(
                $"SELECT set_config('app.current_org_id', {orgIdStr}, true)");

            // 2. Create Organization Admin role
            var role = await db.Set<Role>()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Name == "Organization Admin" && r.OrganizationId == org.Id);
            if (role is null)
            {
                role = Role.Create("Organization Admin", "Full access to all modules and features", org.Id, isSystemRole: true);
                db.Set<Role>().Add(role);
                logger.LogInformation("Created role: Organization Admin");
            }

            // 3. Assign all permissions to the role
            var permissions = await db.Set<Permission>().ToListAsync();
            logger.LogInformation("Found {Count} permissions to assign", permissions.Count);

            var existingPermIds = await db.Set<RolePermission>()
                .Where(rp => rp.RoleId == role.Id)
                .Select(rp => rp.PermissionId)
                .ToListAsync();

            var newPerms = permissions.Where(p => !existingPermIds.Contains(p.Id)).ToList();
            foreach (var perm in newPerms)
            {
                db.Set<RolePermission>().Add(new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = perm.Id
                });
            }

            // 4. Create admin user with hashed password
            var user = User.Create(AdminEmail, "System", "Administrator", org.Id);
            user.SetPassword(hasher.Hash(AdminPassword));
            db.Set<User>().Add(user);

            // 5. Assign role to user
            db.Set<UserRole>().Add(new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id,
                AssignedAt = DateTimeOffset.UtcNow
            });

            await db.SaveChangesAsync();
            await transaction.CommitAsync();

            logger.LogInformation("Development seed COMMITTED successfully:");
            logger.LogInformation("  Organization: {OrgName} (ID: {OrgId})", org.Name, org.Id);
            logger.LogInformation("  Admin user: {Email} / {Password}", AdminEmail, AdminPassword);
            logger.LogInformation("  Role: Organization Admin with {Count} permissions ({New} new)",
                permissions.Count, newPerms.Count);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Development data seeder FAILED: {Message}", ex.Message);
        }
    }

    private static async Task SyncAdminPermissionsAsync(IdentityDbContext db, ILogger logger)
    {
        try
        {
            var admin = await db.Users
                .IgnoreQueryFilters()
                .Include(u => u.UserRoles)
                .FirstAsync(u => u.Email == AdminEmail);

            var org = await db.Set<Organization>()
                .FirstOrDefaultAsync(o => o.Id == admin.OrganizationId);
            if (org is null) return;

            await using var tx = await db.Database.BeginTransactionAsync();
            try { await db.Database.ExecuteSqlRawAsync("SET LOCAL row_security = off"); } catch { }

            var role = await db.Set<Role>()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Name == "Organization Admin" && r.OrganizationId == org.Id);

            if (role is null)
            {
                role = Role.Create("Organization Admin", "Full access to all modules and features", org.Id, isSystemRole: true);
                db.Set<Role>().Add(role);
                await db.SaveChangesAsync();
            }

            if (!admin.UserRoles.Any(ur => ur.RoleId == role.Id))
            {
                db.Set<UserRole>().Add(new UserRole
                {
                    UserId = admin.Id,
                    RoleId = role.Id,
                    AssignedAt = DateTimeOffset.UtcNow
                });
            }

            var allPermissions = await db.Set<Permission>().ToListAsync();
            var existingPermIds = await db.Set<RolePermission>()
                .Where(rp => rp.RoleId == role.Id)
                .Select(rp => rp.PermissionId)
                .ToListAsync();

            var newPerms = allPermissions.Where(p => !existingPermIds.Contains(p.Id)).ToList();
            foreach (var perm in newPerms)
            {
                db.Set<RolePermission>().Add(new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = perm.Id
                });
            }

            await db.SaveChangesAsync();
            await tx.CommitAsync();

            logger.LogInformation("Synced Organization Admin role: {Total} total permissions, {New} newly assigned",
                allPermissions.Count, newPerms.Count);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to sync admin permissions: {Message}", ex.Message);
        }
    }
}
