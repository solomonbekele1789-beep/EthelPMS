using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.MEAL.Domain.Entities;

namespace NGO.PMS.MEAL.Infrastructure.Persistence.Configurations;

public class MealPlanConfiguration : IEntityTypeConfiguration<MealPlan>
{
    public void Configure(EntityTypeBuilder<MealPlan> builder)
    {
        builder.ToTable("meal_plans");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(500);
        builder.Property(e => e.Description).HasMaxLength(4000);
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);

        // 8-section content
        builder.Property(e => e.ResultsAndIndicators).HasColumnType("text");
        builder.Property(e => e.DataQuality).HasColumnType("text");
        builder.Property(e => e.IndicatorProgressPlans).HasColumnType("text");
        builder.Property(e => e.LearningPlan).HasColumnType("text");
        builder.Property(e => e.MelActivities).HasColumnType("text");
        builder.Property(e => e.MelBudget).HasColumnType("text");
        builder.Property(e => e.ReportingPlan).HasColumnType("text");
        builder.Property(e => e.CommunicationPlan).HasColumnType("text");

        // Approval
        builder.Property(e => e.RejectionReason).HasMaxLength(2000);

        // Tenant
        builder.Property(e => e.OrganizationId).IsRequired();

        // Computed — ignore
        builder.Ignore(e => e.OverallCompleteness);

        builder.HasQueryFilter(e => !e.IsDeleted);

        // Relationships
        builder.HasMany(e => e.Indicators)
            .WithOne(i => i.MealPlan!)
            .HasForeignKey(i => i.MealPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => e.OrganizationId);
        builder.HasIndex(e => e.ProjectId);
        builder.HasIndex(e => e.Status);
    }
}
