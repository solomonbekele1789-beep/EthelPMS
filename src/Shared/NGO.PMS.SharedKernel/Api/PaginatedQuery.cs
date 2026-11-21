namespace NGO.PMS.SharedKernel.Api;

/// <summary>
/// Standard base record for paginated list queries.
/// </summary>
public abstract record PaginatedQuery
{
    private const int MaxPageSize = 100;
    private int _page = 1;
    private int _pageSize = 20;

    public int Page
    {
        get => _page;
        init => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        init => _pageSize = value < 1 ? 20 : (value > MaxPageSize ? MaxPageSize : value);
    }

    public string? SortBy { get; init; }
    public string SortDir { get; init; } = "asc";
    public string? Search { get; init; }

    public bool IsDescending =>
        string.Equals(SortDir, "desc", StringComparison.OrdinalIgnoreCase);

    public int Skip => (Page - 1) * PageSize;
}
