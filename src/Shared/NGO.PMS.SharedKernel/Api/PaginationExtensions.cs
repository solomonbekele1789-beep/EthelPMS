using Microsoft.EntityFrameworkCore;

namespace NGO.PMS.SharedKernel.Api;

/// <summary>
/// Extension methods for executing paginated EF Core queries into <see cref="PagedResponse{T}"/>.
/// </summary>
public static class PaginationExtensions
{
    public static async Task<PagedResponse<T>> ToPagedResponseAsync<T>(
        this IQueryable<T> query,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var safePage = page < 1 ? 1 : page;
        var safePageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((safePage - 1) * safePageSize)
            .Take(safePageSize)
            .ToListAsync(cancellationToken);

        return PagedResponse<T>.Ok(items, safePage, safePageSize, totalCount);
    }

    public static Task<PagedResponse<T>> ToPagedResponseAsync<T>(
        this IQueryable<T> query,
        PaginatedQuery request,
        CancellationToken cancellationToken = default) =>
        query.ToPagedResponseAsync(request.Page, request.PageSize, cancellationToken);
}
