using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Procurement.Domain.Entities;

namespace NGO.PMS.Procurement.Infrastructure.Persistence.Configurations;

public class RfqItemConfiguration : IEntityTypeConfiguration<RfqItem>
{
    public void Configure(EntityTypeBuilder<RfqItem> builder)
    {
        builder.ToTable("rfq_items");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Description).IsRequired().HasMaxLength(500);
        builder.Property(e => e.Quantity).HasPrecision(18, 2);
        builder.Property(e => e.Unit).IsRequired().HasMaxLength(100);

        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => e.RfqId);
    }
}
