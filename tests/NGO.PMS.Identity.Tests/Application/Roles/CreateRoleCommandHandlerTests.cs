using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application.Roles.Commands.CreateRole;
using NGO.PMS.Identity.Domain.Entities;
using NGO.PMS.Identity.Tests.Helpers;

namespace NGO.PMS.Identity.Tests.Application.Roles;

public class CreateRoleCommandHandlerTests
{
    [Fact]
    public async Task CreateRoleCommandHandler_ShouldCreateWithPermissions()
    {
        // Arrange
        var orgId = Guid.NewGuid();
        var currentUser = IdentityTestFixture.CreateMockCurrentUser(orgId: orgId);
        var db = IdentityTestFixture.CreateInMemoryDbContext(orgId);

        // Seed 2 permissions
        var perm1 = new Permission
        {
            Code = "identity.users.read",
            DisplayName = "Read Users",
            Module = "identity",
            Resource = "users",
            Action = "read"
        };
        var perm2 = new Permission
        {
            Code = "identity.users.create",
            DisplayName = "Create Users",
            Module = "identity",
            Resource = "users",
            Action = "create"
        };
        db.Permissions.Add(perm1);
        db.Permissions.Add(perm2);
        await db.SaveChangesAsync();

        var handler = new CreateRoleCommandHandler(db, currentUser);
        var command = new CreateRoleCommand("Editor", "Can edit things", [perm1.Id, perm2.Id]);

        // Act
        var roleId = await handler.Handle(command, CancellationToken.None);

        // Assert
        roleId.Should().NotBeEmpty();
        var role = await db.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == roleId);
        role.Should().NotBeNull();
        role!.Name.Should().Be("Editor");
        role.RolePermissions.Should().HaveCount(2);
    }
}
