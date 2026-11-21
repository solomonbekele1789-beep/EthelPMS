using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace NGO.PMS.API.Tests;

/// <summary>
/// WebApplicationFactory for API integration tests.
/// Requires ETH_TEST_CONNECTION_STRING environment variable or local PostgreSQL test instance.
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, config) =>
        {
            var connStr = Environment.GetEnvironmentVariable("ETH_TEST_CONNECTION_STRING")
                ?? "Host=localhost;Port=5432;Database=ethelpms_test;Username=postgres;Password=postgres";

            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = connStr,
                ["JwtSettings:SecretKey"] = "Integration-Test-Secret-Key-At-Least-32-Chars-Long!",
                ["JwtSettings:Issuer"] = "EthelPMS",
                ["JwtSettings:Audience"] = "EthelPMS.Client",
                ["JwtSettings:AccessTokenExpirationMinutes"] = "360"
            });
        });
    }
}
