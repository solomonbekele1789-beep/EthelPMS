using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Planning.Domain.Entities;

namespace NGO.PMS.Planning.Infrastructure.Persistence.Configurations;

public class PlanIndicatorAllocationConfiguration : IEntityTypeConfiguration<PlanIndicatorAllocation>
{
    public void Configure(EntityTypeBuilder<PlanIndicatorAllocation> builder)
    {
        builder.ToTable("plan_indicator_allocations");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.TargetValue).HasPrecision(18, 4);
        builder.Property(e => e.ActualValue).HasPrecision(18, 4);
        builder.HasIndex(e => new { e.PlanEntryId, e.IndicatorId })
            .IsUnique().HasDatabaseName("uq_plan_indicator_allocation");
    }
}
