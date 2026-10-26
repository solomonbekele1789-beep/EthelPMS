using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Assets.Application.Abstractions;

public interface IAssetsDbContext
{
    DbSet<AssetCategory> AssetCategories { get; }
    DbSet<Asset> Assets { get; }
    DbSet<AssetAssignment> AssetAssignments { get; }
    DbSet<AssetTransfer> AssetTransfers { get; }
    DbSet<AssetDisposal> AssetDisposals { get; }
    DbSet<AssetMaintenance> AssetMaintenances { get; }
    DbSet<StockItem> StockItems { get; }
    DbSet<StockMovement> StockMovements { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
