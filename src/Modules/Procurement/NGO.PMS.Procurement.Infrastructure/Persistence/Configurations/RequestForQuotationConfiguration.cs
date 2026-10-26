using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Procurement.Domain.Entities;

namespace NGO.PMS.Procurement.Infrastructure.Persistence.Configurations;

public class RequestForQuotationConfiguration : IEntityTypeConfiguration<RequestForQuotation>
{
    public void Configure(EntityTypeBuilder<RequestForQuotation> builder)
    {
        builder.ToTable("rfqs");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.ReferenceNumber).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.TermsAndConditions).HasColumnType("text");

        builder.Property(e => e.OrganizationId).IsRequired();

        // Relationships
        builder.HasMany(e => e.Items)
            .WithOne()
            .HasForeignKey(i => i.RfqId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Responses)
            .WithOne()
            .HasForeignKey(r => r.RfqId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => e.OrganizationId);
        builder.HasIndex(e => e.PurchaseRequestId);
        builder.HasIndex(e => e.ReferenceNumber).IsUnique();
        builder.HasIndex(e => e.Status);
    }
}
