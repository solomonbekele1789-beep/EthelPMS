namespace NGO.PMS.SharedKernel.Api;

/// <summary>
/// Base record for paginated queries supporting standard date, status, and office filters.
/// </summary>
public abstract record FilteredQuery : PaginatedQuery
{
    public string? Status { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public Guid? OfficeId { get; init; }
}
