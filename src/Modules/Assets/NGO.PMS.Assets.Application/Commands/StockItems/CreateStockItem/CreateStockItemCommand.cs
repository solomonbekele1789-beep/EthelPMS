using MediatR;

namespace NGO.PMS.Assets.Application.Commands.StockItems.CreateStockItem;

public sealed record CreateStockItemCommand(
    string ItemCode,
    string Name,
    string Category,
    string Unit,
    decimal ReorderLevel,
    decimal UnitCost,
    string? Description,
    string? StorageLocation) : IRequest<Guid>;
