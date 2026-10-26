using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Procurement.Domain.Entities;

namespace NGO.PMS.Procurement.Infrastructure.Persistence.Configurations;

public class RfqResponseConfiguration : IEntityTypeConfiguration<RfqResponse>
{
    public void Configure(EntityTypeBuilder<RfqResponse> builder)
    {
        builder.ToTable("rfq_responses");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.TotalQuotedAmount).HasPrecision(18, 2);
        builder.Property(e => e.Notes).HasMaxLength(2000);

        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => new { e.RfqId, e.SupplierId });
    }
}
