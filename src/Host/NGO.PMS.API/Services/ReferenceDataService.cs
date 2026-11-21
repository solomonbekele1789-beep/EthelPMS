using Dapper;
using Microsoft.Extensions.Caching.Memory;
using NGO.PMS.SharedKernel.Services;
using Npgsql;

namespace NGO.PMS.API.Services;

/// <summary>
/// Dapper + IMemoryCache (1 hour TTL) implementation of IReferenceDataService.
/// </summary>
public sealed class ReferenceDataService(
    IConfiguration configuration,
    IMemoryCache cache) : IReferenceDataService
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

    private string ConnectionString =>
        configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

    public async Task<IReadOnlyList<CurrencyRefDto>> GetCurrenciesAsync(CancellationToken ct = default)
    {
        return await cache.GetOrCreateAsync("ref:currencies", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;
            await using var conn = new NpgsqlConnection(ConnectionString);
            var rows = await conn.QueryAsync<CurrencyRefDto>(
                "SELECT code AS Code, name AS Name, symbol AS Symbol, decimal_places AS DecimalPlaces FROM reference.currencies ORDER BY code");
            return (IReadOnlyList<CurrencyRefDto>)rows.ToList().AsReadOnly();
        }) ?? [];
    }

    public async Task<IReadOnlyList<CountryRefDto>> GetCountriesAsync(CancellationToken ct = default)
    {
        return await cache.GetOrCreateAsync("ref:countries", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;
            await using var conn = new NpgsqlConnection(ConnectionString);
            var rows = await conn.QueryAsync<CountryRefDto>(
                "SELECT code AS Code, name AS Name FROM reference.countries ORDER BY name");
            return (IReadOnlyList<CountryRefDto>)rows.ToList().AsReadOnly();
        }) ?? [];
    }

    public async Task<IReadOnlyList<RegionRefDto>> GetEthiopianRegionsAsync(CancellationToken ct = default)
    {
        return await cache.GetOrCreateAsync("ref:ethiopian_regions", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;
            await using var conn = new NpgsqlConnection(ConnectionString);
            var rows = await conn.QueryAsync<RegionRefDto>(
                "SELECT code AS Code, name AS Name, NULL::text AS NameAm FROM reference.regions ORDER BY name");
            return (IReadOnlyList<RegionRefDto>)rows.ToList().AsReadOnly();
        }) ?? [];
    }
}
