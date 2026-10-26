using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Infrastructure.Persistence.Configurations;

public class IndicatorConfiguration : IEntityTypeConfiguration<Indicator>
{
    public void Configure(EntityTypeBuilder<Indicator> builder)
    {
        builder.ToTable("indicators");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Code).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.DataSource).HasMaxLength(500);
        builder.Property(e => e.CollectionFrequency).HasMaxLength(50);
        builder.Property(e => e.MeansOfVerification).HasMaxLength(2000);
        builder.Property(e => e.BaselineValue).HasPrecision(18, 4);
        builder.Property(e => e.TargetValue).HasPrecision(18, 4);
        builder.Property(e => e.DeletedBy).HasMaxLength(200);

        builder.HasIndex(e => e.ProjectId).HasDatabaseName("ix_indicators_project");

        builder.HasMany(e => e.Targets).WithOne(t => t.Indicator).HasForeignKey(t => t.IndicatorId);
        builder.HasOne(e => e.UnitOfMeasurement).WithMany().HasForeignKey(e => e.UnitOfMeasurementId);
    }
}
