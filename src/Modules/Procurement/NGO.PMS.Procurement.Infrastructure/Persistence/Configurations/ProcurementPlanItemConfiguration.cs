using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Procurement.Domain.Entities;

namespace NGO.PMS.Procurement.Infrastructure.Persistence.Configurations;

public class ProcurementPlanItemConfiguration : IEntityTypeConfiguration<ProcurementPlanItem>
{
    public void Configure(EntityTypeBuilder<ProcurementPlanItem> builder)
    {
        builder.ToTable("procurement_plan_items");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Description).IsRequired().HasMaxLength(500);
        builder.Property(e => e.EstimatedCost).HasPrecision(18, 2);
        builder.Property(e => e.Method).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.Unit).HasMaxLength(100);

        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => e.ProcurementPlanId);
    }
}
