using NGO.PMS.Assets.Domain.Enums;
using NGO.PMS.Assets.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Domain.Entities;

public class StockMovement : AuditableEntity
{
    public Guid StockItemId { get; private set; }
    public StockMovementType MovementType { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitCost { get; private set; }
    public string? ReferenceNumber { get; private set; }
    public string? Notes { get; private set; }
    public DateTime MovementDate { get; private set; }
    public Guid? ProjectId { get; set; }

    // Multi-tenancy
    public Guid OrganizationId { get; set; }

    public static StockMovement Create(
        Guid stockItemId,
        StockMovementType movementType,
        decimal quantity,
        decimal unitCost,
        DateTime movementDate,
        Guid orgId)
    {
        if (stockItemId == Guid.Empty)
            throw new ArgumentException("Stock item ID is required.", nameof(stockItemId));
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.", nameof(quantity));
        if (unitCost < 0)
            throw new ArgumentException("Unit cost cannot be negative.", nameof(unitCost));

        var movement = new StockMovement
        {
            StockItemId = stockItemId,
            MovementType = movementType,
            Quantity = quantity,
            UnitCost = unitCost,
            MovementDate = movementDate,
            OrganizationId = orgId
        };

        if (movementType == StockMovementType.Issue)
        {
            movement.AddDomainEvent(new StockIssuedEvent(
                movement.StockItemId, movement.Id, movement.Quantity));
        }

        return movement;
    }
}
