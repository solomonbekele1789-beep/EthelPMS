namespace NGO.PMS.SharedKernel.Services;

public record CurrencyRefDto(string Code, string Name, string Symbol, int DecimalPlaces);
public record CountryRefDto(string Code, string Name);
public record RegionRefDto(string Code, string Name, string? NameAm);

/// <summary>
/// Cached read-only access to the shared PostgreSQL 'reference' schema.
/// </summary>
public interface IReferenceDataService
{
    Task<IReadOnlyList<CurrencyRefDto>> GetCurrenciesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<CountryRefDto>> GetCountriesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<RegionRefDto>> GetEthiopianRegionsAsync(CancellationToken ct = default);
}
