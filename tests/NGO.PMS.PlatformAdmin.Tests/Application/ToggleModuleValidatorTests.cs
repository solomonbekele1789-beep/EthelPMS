using FluentAssertions;
using NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ToggleModule;
using Xunit;

namespace NGO.PMS.PlatformAdmin.Tests.Application;

public class ToggleModuleValidatorTests
{
    private readonly ToggleModuleCommandValidator _validator = new();

    [Fact]
    public void Validate_ShouldSucceed_ForValidModuleName()
    {
        var result = _validator.Validate(new ToggleModuleCommand(Guid.NewGuid(), "projects", true));
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_ShouldFail_ForUnknownModuleName()
    {
        var result = _validator.Validate(new ToggleModuleCommand(Guid.NewGuid(), "nonexistent-module", true));
        result.IsValid.Should().BeFalse();
    }
}
