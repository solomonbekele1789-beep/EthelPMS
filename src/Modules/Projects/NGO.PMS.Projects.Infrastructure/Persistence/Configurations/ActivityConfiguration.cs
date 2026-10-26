using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Infrastructure.Persistence.Configurations;

public class ActivityConfiguration : IEntityTypeConfiguration<Activity>
{
    public void Configure(EntityTypeBuilder<Activity> builder)
    {
        builder.ToTable("activities");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Code).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.Unit).HasMaxLength(50);
        builder.Property(e => e.Assumptions).HasMaxLength(2000);
        builder.Property(e => e.LifetimeTarget).HasPrecision(18, 4);
        builder.Property(e => e.BudgetAllocated).HasPrecision(18, 2);
        builder.Property(e => e.DeletedBy).HasMaxLength(200);

        builder.HasIndex(e => e.OutputId).HasDatabaseName("ix_activities_output");
    }
}
