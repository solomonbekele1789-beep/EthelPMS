using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Infrastructure.Persistence.Configurations;

public class UnitOfMeasurementConfiguration : IEntityTypeConfiguration<UnitOfMeasurement>
{
    public void Configure(EntityTypeBuilder<UnitOfMeasurement> builder)
    {
        builder.ToTable("units_of_measurement");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Abbreviation).HasMaxLength(20);
        builder.HasIndex(e => e.OrganizationId).HasDatabaseName("ix_uom_organization");
    }
}
