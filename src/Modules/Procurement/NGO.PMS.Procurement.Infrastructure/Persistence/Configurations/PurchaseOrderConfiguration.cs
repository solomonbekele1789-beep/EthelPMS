using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Procurement.Domain.Entities;

namespace NGO.PMS.Procurement.Infrastructure.Persistence.Configurations;

public class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        builder.ToTable("purchase_orders");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.ReferenceNumber).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.DeliveryAddress).HasMaxLength(500);
        builder.Property(e => e.PaymentTerms).HasMaxLength(500);
        builder.Property(e => e.SpecialConditions).HasColumnType("text");

        builder.Property(e => e.OrganizationId).IsRequired();

        // Computed — ignore
        builder.Ignore(e => e.TotalAmount);

        // Relationships
        builder.HasMany(e => e.Items)
            .WithOne()
            .HasForeignKey(i => i.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => e.OrganizationId);
        builder.HasIndex(e => e.PurchaseRequestId);
        builder.HasIndex(e => e.SupplierId);
        builder.HasIndex(e => e.ReferenceNumber).IsUnique();
        builder.HasIndex(e => e.Status);
    }
}
