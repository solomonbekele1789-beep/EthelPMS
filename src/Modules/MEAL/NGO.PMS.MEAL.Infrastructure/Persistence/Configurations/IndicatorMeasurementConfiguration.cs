using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.MEAL.Domain.Entities;

namespace NGO.PMS.MEAL.Infrastructure.Persistence.Configurations;

public class IndicatorMeasurementConfiguration : IEntityTypeConfiguration<IndicatorMeasurement>
{
    public void Configure(EntityTypeBuilder<IndicatorMeasurement> builder)
    {
        builder.ToTable("indicator_measurements");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Period).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Value).HasPrecision(18, 4);
        builder.Property(e => e.DisaggregatedMale).HasPrecision(18, 4);
        builder.Property(e => e.DisaggregatedFemale).HasPrecision(18, 4);
        builder.Property(e => e.Notes).HasMaxLength(2000);
        builder.Property(e => e.DataQualityNotes).HasMaxLength(2000);
        builder.Property(e => e.MeasurementDate).IsRequired();

        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => e.MealIndicatorId);
        builder.HasIndex(e => new { e.MealIndicatorId, e.Period });
    }
}
