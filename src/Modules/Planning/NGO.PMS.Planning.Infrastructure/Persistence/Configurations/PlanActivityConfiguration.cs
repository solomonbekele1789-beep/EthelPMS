using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Planning.Domain.Entities;

namespace NGO.PMS.Planning.Infrastructure.Persistence.Configurations;

public class PlanActivityConfiguration : IEntityTypeConfiguration<PlanActivity>
{
    public void Configure(EntityTypeBuilder<PlanActivity> builder)
    {
        builder.ToTable("plan_activities");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.PlannedBudget).HasPrecision(18, 2);
        builder.HasIndex(e => e.PlanEntryId).HasDatabaseName("ix_plan_activities_plan");
    }
}
