using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Procurement.Domain.Entities;

namespace NGO.PMS.Procurement.Infrastructure.Persistence.Configurations;

public class GrnItemConfiguration : IEntityTypeConfiguration<GrnItem>
{
    public void Configure(EntityTypeBuilder<GrnItem> builder)
    {
        builder.ToTable("grn_items");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.QuantityReceived).HasPrecision(18, 2);
        builder.Property(e => e.QuantityAccepted).HasPrecision(18, 2);
        builder.Property(e => e.RejectionReason).HasMaxLength(2000);

        builder.Property(e => e.OrganizationId).IsRequired();

        // Computed — ignore
        builder.Ignore(e => e.QuantityRejected);

        // Indexes
        builder.HasIndex(e => e.GrnId);
        builder.HasIndex(e => e.PurchaseOrderItemId);
    }
}
