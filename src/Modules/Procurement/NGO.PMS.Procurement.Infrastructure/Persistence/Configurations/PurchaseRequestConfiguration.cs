using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Procurement.Domain.Entities;

namespace NGO.PMS.Procurement.Infrastructure.Persistence.Configurations;

public class PurchaseRequestConfiguration : IEntityTypeConfiguration<PurchaseRequest>
{
    public void Configure(EntityTypeBuilder<PurchaseRequest> builder)
    {
        builder.ToTable("purchase_requests");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.ReferenceNumber).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Justification).IsRequired().HasMaxLength(1000);
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.Method).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.RejectionReason).HasMaxLength(2000);

        builder.Property(e => e.OrganizationId).IsRequired();

        // Computed — ignore
        builder.Ignore(e => e.TotalAmount);

        // Relationships
        builder.HasMany(e => e.Items)
            .WithOne()
            .HasForeignKey(i => i.PurchaseRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => e.OrganizationId);
        builder.HasIndex(e => e.ProjectId);
        builder.HasIndex(e => e.ReferenceNumber).IsUnique();
        builder.HasIndex(e => e.Status);
    }
}
