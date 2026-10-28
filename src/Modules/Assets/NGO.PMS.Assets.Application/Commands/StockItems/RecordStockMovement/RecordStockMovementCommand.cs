using MediatR;
using NGO.PMS.Assets.Domain.Enums;

namespace NGO.PMS.Assets.Application.Commands.StockItems.RecordStockMovement;

public sealed record RecordStockMovementCommand(
    Guid StockItemId,
    StockMovementType MovementType,
    decimal Quantity,
    decimal UnitCost,
    DateTime MovementDate,
    string? ReferenceNumber,
    string? Notes,
    Guid? ProjectId) : IRequest<Guid>;
