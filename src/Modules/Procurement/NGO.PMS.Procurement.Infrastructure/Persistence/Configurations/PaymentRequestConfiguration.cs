using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Procurement.Domain.Entities;

namespace NGO.PMS.Procurement.Infrastructure.Persistence.Configurations;

public class PaymentRequestConfiguration : IEntityTypeConfiguration<PaymentRequest>
{
    public void Configure(EntityTypeBuilder<PaymentRequest> builder)
    {
        builder.ToTable("payment_requests");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.ReferenceNumber).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.Amount).HasPrecision(18, 2);
        builder.Property(e => e.PaymentMethod).HasMaxLength(100);
        builder.Property(e => e.BankDetails).HasMaxLength(500);
        builder.Property(e => e.RejectionReason).HasMaxLength(2000);

        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => e.OrganizationId);
        builder.HasIndex(e => e.SupplierInvoiceId);
        builder.HasIndex(e => e.ProjectId);
        builder.HasIndex(e => e.ReferenceNumber).IsUnique();
        builder.HasIndex(e => e.Status);
    }
}
