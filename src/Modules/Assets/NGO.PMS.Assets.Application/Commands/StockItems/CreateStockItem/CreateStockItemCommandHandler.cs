using MediatR;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Application.Commands.StockItems.CreateStockItem;

public sealed class CreateStockItemCommandHandler : IRequestHandler<CreateStockItemCommand, Guid>
{
    private readonly IAssetsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateStockItemCommandHandler(IAssetsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateStockItemCommand request, CancellationToken ct)
    {
        var stockItem = StockItem.Create(
            request.ItemCode,
            request.Name,
            request.Category,
            request.Unit,
            request.ReorderLevel,
            request.UnitCost,
            _currentUser.OrganizationId);

        _db.StockItems.Add(stockItem);
        await _db.SaveChangesAsync(ct);
        return stockItem.Id;
    }
}
