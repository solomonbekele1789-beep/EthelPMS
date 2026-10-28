using MediatR;
using NGO.PMS.Assets.Application.DTOs;

namespace NGO.PMS.Assets.Application.Queries.ListStockItems;

public sealed record ListStockItemsQuery(
    string? Category,
    string? Search) : IRequest<List<StockItemDto>>;
