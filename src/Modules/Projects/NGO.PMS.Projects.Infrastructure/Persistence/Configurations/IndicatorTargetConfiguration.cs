using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Infrastructure.Persistence.Configurations;

public class IndicatorTargetConfiguration : IEntityTypeConfiguration<IndicatorTarget>
{
    public void Configure(EntityTypeBuilder<IndicatorTarget> builder)
    {
        builder.ToTable("indicator_targets");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Period).IsRequired().HasMaxLength(50);
        builder.Property(e => e.TargetValue).HasPrecision(18, 4);
        builder.Property(e => e.ActualValue).HasPrecision(18, 4);
        builder.HasIndex(e => e.IndicatorId).HasDatabaseName("ix_indicator_targets_indicator");
    }
}
