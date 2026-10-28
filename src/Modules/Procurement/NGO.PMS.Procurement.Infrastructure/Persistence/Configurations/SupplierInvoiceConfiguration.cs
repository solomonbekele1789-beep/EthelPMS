using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Procurement.Domain.Entities;

namespace NGO.PMS.Procurement.Infrastructure.Persistence.Configurations;

public class SupplierInvoiceConfiguration : IEntityTypeConfiguration<SupplierInvoice>
{
    public void Configure(EntityTypeBuilder<SupplierInvoice> builder)
    {
        builder.ToTable("supplier_invoices");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.InvoiceNumber).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.ThreeWayMatchStatus).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.InvoiceAmount).HasPrecision(18, 2);
        builder.Property(e => e.VerifiedAmount).HasPrecision(18, 2);
        builder.Property(e => e.DisputeReason).HasMaxLength(2000);

        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => new { e.OrganizationId, e.InvoiceNumber });
        builder.HasIndex(e => e.PurchaseOrderId);
        builder.HasIndex(e => e.SupplierId);
        builder.HasIndex(e => e.Status);
    }
}
