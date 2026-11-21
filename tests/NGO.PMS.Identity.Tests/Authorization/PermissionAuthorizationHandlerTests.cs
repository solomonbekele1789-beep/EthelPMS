using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using NGO.PMS.SharedKernel.Authorization;
using NSubstitute;
using Xunit;

namespace NGO.PMS.Identity.Tests.Authorization;

public class PermissionAuthorizationHandlerTests
{
    [Fact]
    public async Task SuperAdmin_ShouldSucceed_ForPlatformPermission()
    {
        var permissionService = Substitute.For<IPermissionService>();
        var handler = new PermissionAuthorizationHandler(permissionService);
        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", Guid.NewGuid().ToString()),
            new Claim("roles", "SuperAdmin")
        ], "jwt"));

        var req = new PermissionRequirement("platform.tenants.manage");
        var ctx = new AuthorizationHandlerContext([req], user, null);

        await handler.HandleAsync(ctx);
        ctx.HasSucceeded.Should().BeTrue();
    }

    [Fact]
    public async Task OrganizationAdmin_ShouldNotBypass_PlatformPermission()
    {
        var permissionService = Substitute.For<IPermissionService>();
        var handler = new PermissionAuthorizationHandler(permissionService);
        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", Guid.NewGuid().ToString()),
            new Claim("roles", "Organization Admin"),
            new Claim("permissions", "identity.users.read")
        ], "jwt"));

        var req = new PermissionRequirement("platform.tenants.manage");
        var ctx = new AuthorizationHandlerContext([req], user, null);

        await handler.HandleAsync(ctx);
        ctx.HasSucceeded.Should().BeFalse();
    }

    [Fact]
    public async Task UserWithJwtClaim_ShouldSucceed_WithoutDbLookup()
    {
        var permissionService = Substitute.For<IPermissionService>();
        var handler = new PermissionAuthorizationHandler(permissionService);
        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", Guid.NewGuid().ToString()),
            new Claim("permissions", "identity.users.create")
        ], "jwt"));

        var req = new PermissionRequirement("identity.users.create");
        var ctx = new AuthorizationHandlerContext([req], user, null);

        await handler.HandleAsync(ctx);
        ctx.HasSucceeded.Should().BeTrue();
        await permissionService.DidNotReceive().HasPermissionAsync(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UserWithoutJwtClaim_ShouldFallbackToDbCheck()
    {
        var userId = Guid.NewGuid();
        var permissionService = Substitute.For<IPermissionService>();
        permissionService.HasPermissionAsync(userId, "projects.create", Arg.Any<CancellationToken>())
            .Returns(true);

        var handler = new PermissionAuthorizationHandler(permissionService);
        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", userId.ToString())
        ], "jwt"));

        var req = new PermissionRequirement("projects.create");
        var ctx = new AuthorizationHandlerContext([req], user, null);

        await handler.HandleAsync(ctx);
        ctx.HasSucceeded.Should().BeTrue();
    }

    [Fact]
    public async Task AbacRuleFailure_ShouldDenyAccess_EvenWithRbacPermission()
    {
        var userId = Guid.NewGuid();
        var permissionService = Substitute.For<IPermissionService>();
        var abacContext = new Dictionary<string, object> { ["amount"] = 500000m };
        permissionService.EvaluateAttributeRulesAsync(userId, "procurement.approve", abacContext, Arg.Any<CancellationToken>())
            .Returns(false);

        var handler = new PermissionAuthorizationHandler(permissionService);
        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim("sub", userId.ToString()),
            new Claim("permissions", "procurement.approve")
        ], "jwt"));

        var req = new PermissionRequirement("procurement.approve");
        var ctx = new AuthorizationHandlerContext([req], user, abacContext);

        await handler.HandleAsync(ctx);
        ctx.HasSucceeded.Should().BeFalse();
    }
}
