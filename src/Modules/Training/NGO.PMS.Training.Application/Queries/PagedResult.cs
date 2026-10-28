namespace NGO.PMS.Training.Application.Queries;

public sealed record PagedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize);
