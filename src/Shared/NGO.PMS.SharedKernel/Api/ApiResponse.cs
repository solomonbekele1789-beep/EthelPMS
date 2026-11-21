namespace NGO.PMS.SharedKernel.Api;

/// <summary>
/// Structured API error item per docs/plans/shared/API-CONVENTIONS.md.
/// </summary>
public record ApiError(string Code, string Message, string? Field = null);

/// <summary>
/// Standard API response envelope.
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Message { get; init; }
    public List<string> Errors { get; init; } = [];
    public IReadOnlyList<ApiError>? ErrorDetails { get; init; }

    public static ApiResponse<T> Ok(T data, string? message = null) =>
        new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> Fail(string error) =>
        new() { Success = false, Message = error, Errors = [error] };

    public static ApiResponse<T> Fail(List<string> errors) =>
        new() { Success = false, Errors = errors };

    public static ApiResponse<T> Fail(string message, IReadOnlyList<ApiError> details) =>
        new()
        {
            Success = false,
            Message = message,
            Errors = details.Select(d => d.Message).ToList(),
            ErrorDetails = details
        };
}

/// <summary>
/// Paginated API response.
/// </summary>
public class PagedResponse<T> : ApiResponse<IReadOnlyList<T>>
{
    public IReadOnlyList<T>? Items => Data;
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling(TotalCount / (double)PageSize) : 0;
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;

    public static PagedResponse<T> Ok(IReadOnlyList<T> data, int page, int pageSize, int totalCount) =>
        new()
        {
            Success = true,
            Data = data,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
}
