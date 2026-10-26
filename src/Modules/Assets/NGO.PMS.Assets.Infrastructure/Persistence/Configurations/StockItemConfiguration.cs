using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Assets.Domain.Entities;

namespace NGO.PMS.Assets.Infrastructure.Persistence.Configurations;

public class StockItemConfiguration : IEntityTypeConfiguration<StockItem>
{
    public void Configure(EntityTypeBuilder<StockItem> builder)
    {
        builder.ToTable("stock_items");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.ItemCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.Category)
            .HasMaxLength(100);

        builder.Property(e => e.Unit)
            .HasMaxLength(50);

        builder.Property(e => e.QuantityOnHand)
            .HasPrecision(18, 4);

        builder.Property(e => e.ReorderLevel)
            .HasPrecision(18, 4);

        builder.Property(e => e.UnitCost)
            .HasPrecision(18, 4);

        builder.Property(e => e.StorageLocation)
            .HasMaxLength(200);

        builder.Property(e => e.DeletedBy)
            .HasMaxLength(200);

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasMany<StockMovement>()
            .WithOne()
            .HasForeignKey(e => e.StockItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.OrganizationId, e.ItemCode })
            .IsUnique()
            .HasDatabaseName("uq_stock_items_org_code");
    }
}
