using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.MEAL.Domain.Entities;

namespace NGO.PMS.MEAL.Infrastructure.Persistence.Configurations;

public class MealIndicatorConfiguration : IEntityTypeConfiguration<MealIndicator>
{
    public void Configure(EntityTypeBuilder<MealIndicator> builder)
    {
        builder.ToTable("meal_indicators");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).IsRequired().HasMaxLength(500);
        builder.Property(e => e.Level).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.CollectionFrequency).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.VerificationFrequency).HasConversion<string>().HasMaxLength(50);

        builder.Property(e => e.BaselineValue).HasPrecision(18, 4);
        builder.Property(e => e.TargetValue).HasPrecision(18, 4);

        builder.Property(e => e.MeansOfVerification).HasMaxLength(1000);
        builder.Property(e => e.DataSource).HasMaxLength(500);
        builder.Property(e => e.CollectionTool).HasMaxLength(500);
        builder.Property(e => e.AnalysisMethod).HasMaxLength(1000);
        builder.Property(e => e.QualityRisks).HasMaxLength(2000);
        builder.Property(e => e.VerificationMethod).HasMaxLength(1000);
        builder.Property(e => e.DisaggregationTypes).HasMaxLength(1000);

        builder.Property(e => e.OrganizationId).IsRequired();

        // Relationships
        builder.HasMany(e => e.Measurements)
            .WithOne(m => m.MealIndicator!)
            .HasForeignKey(m => m.MealIndicatorId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => e.MealPlanId);
        builder.HasIndex(e => e.OrganizationId);
        builder.HasIndex(e => e.IndicatorId);
    }
}
