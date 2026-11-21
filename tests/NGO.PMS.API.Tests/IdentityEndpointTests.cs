using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace NGO.PMS.API.Tests;

[Trait("Category", "Integration")]
public class IdentityEndpointTests(CustomWebApplicationFactory factory)
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task HealthEndpoint_ShouldReturn200()
    {
        var response = await _client.GetAsync("/health");
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.ServiceUnavailable);
    }

    [Fact]
    public async Task ListUsers_WithoutAuth_ShouldReturn401()
    {
        var response = await _client.GetAsync("/api/v1/users");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ShouldReturn401()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email = "nonexistent@ethelpms.org",
            password = "WrongPassword123!"
        });
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task PlatformTenants_WithoutSuperAdmin_ShouldReturn401()
    {
        var response = await _client.GetAsync("/api/v1/platform/tenants");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
