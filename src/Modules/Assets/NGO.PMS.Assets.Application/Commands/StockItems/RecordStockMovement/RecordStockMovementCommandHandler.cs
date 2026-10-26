using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Domain.Entities;
using NGO.PMS.Assets.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Assets.Application.Commands.StockItems.RecordStockMovement;

public sealed class RecordStockMovementCommandHandler : IRequestHandler<RecordStockMovementCommand, Guid>
{
    private readonly IAssetsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RecordStockMovementCommandHandler(IAssetsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(RecordStockMovementCommand request, CancellationToken ct)
    {
        var stockItem = await _db.StockItems
            .FirstOrDefaultAsync(s => s.Id == request.StockItemId, ct);

        if (stockItem is null)
            throw new NotFoundException(nameof(StockItem), request.StockItemId);

        var movement = StockMovement.Create(
            request.StockItemId,
            request.MovementType,
            request.Quantity,
            request.UnitCost,
            request.MovementDate,
            _currentUser.OrganizationId);

        if (request.ProjectId.HasValue)
            movement.ProjectId = request.ProjectId;

        // Update stock quantity
        var currentQty = stockItem.QuantityOnHand;
        var newQty = request.MovementType switch
        {
            StockMovementType.Receipt or StockMovementType.Return => currentQty + request.Quantity,
            StockMovementType.Issue or StockMovementType.Transfer => currentQty - request.Quantity,
            _ => currentQty + request.Quantity // Adjustment: treat as addition
        };

        stockItem.UpdateQuantity(newQty);

        _db.StockMovements.Add(movement);
        await _db.SaveChangesAsync(ct);
        return movement.Id;
    }
}
