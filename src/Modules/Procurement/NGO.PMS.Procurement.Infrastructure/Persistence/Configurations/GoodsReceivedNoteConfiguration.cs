using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Procurement.Domain.Entities;

namespace NGO.PMS.Procurement.Infrastructure.Persistence.Configurations;

public class GoodsReceivedNoteConfiguration : IEntityTypeConfiguration<GoodsReceivedNote>
{
    public void Configure(EntityTypeBuilder<GoodsReceivedNote> builder)
    {
        builder.ToTable("goods_received_notes");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.ReferenceNumber).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.ReceivedBy).IsRequired().HasMaxLength(200);
        builder.Property(e => e.DeliveryNoteNumber).HasMaxLength(100);
        builder.Property(e => e.Remarks).HasMaxLength(2000);

        builder.Property(e => e.OrganizationId).IsRequired();

        // Relationships
        builder.HasMany(e => e.Items)
            .WithOne()
            .HasForeignKey(i => i.GrnId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => e.OrganizationId);
        builder.HasIndex(e => e.PurchaseOrderId);
        builder.HasIndex(e => e.ReferenceNumber).IsUnique();
    }
}
