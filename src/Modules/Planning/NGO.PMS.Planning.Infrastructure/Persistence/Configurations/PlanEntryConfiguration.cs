using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Planning.Domain.Entities;

namespace NGO.PMS.Planning.Infrastructure.Persistence.Configurations;

public class PlanEntryConfiguration : IEntityTypeConfiguration<PlanEntry>
{
    public void Configure(EntityTypeBuilder<PlanEntry> builder)
    {
        builder.ToTable("plan_entries");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Description).HasMaxLength(4000);
        builder.Property(e => e.Level).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.ApprovalStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.PlannedBudget).HasPrecision(18, 2);
        builder.Property(e => e.ActualBudget).HasPrecision(18, 2);
        builder.Property(e => e.RejectionReason).HasMaxLength(2000);
        builder.Property(e => e.DeletedBy).HasMaxLength(200);

        builder.HasIndex(e => e.ProjectId).HasDatabaseName("ix_plan_entries_project");
        builder.HasIndex(e => e.ParentId).HasDatabaseName("ix_plan_entries_parent");
        builder.HasIndex(e => e.OrganizationId).HasDatabaseName("ix_plan_entries_org");
        builder.HasIndex(e => new { e.ProjectId, e.Level }).HasDatabaseName("ix_plan_entries_project_level");
        builder.HasIndex(e => new { e.ProjectId, e.Level, e.FiscalYear }).HasDatabaseName("ix_plan_entries_project_level_year");

        builder.HasOne(e => e.Parent)
            .WithMany(e => e.Children)
            .HasForeignKey(e => e.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.IndicatorAllocations)
            .WithOne(ia => ia.PlanEntry)
            .HasForeignKey(ia => ia.PlanEntryId);

        builder.HasMany(e => e.PlanActivities)
            .WithOne(pa => pa.PlanEntry)
            .HasForeignKey(pa => pa.PlanEntryId);
    }
}
