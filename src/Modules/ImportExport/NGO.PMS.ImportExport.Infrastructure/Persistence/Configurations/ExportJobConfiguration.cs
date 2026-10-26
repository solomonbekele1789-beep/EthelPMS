using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.ImportExport.Domain.Entities;

namespace NGO.PMS.ImportExport.Infrastructure.Persistence.Configurations;

public class ExportJobConfiguration : IEntityTypeConfiguration<ExportJob>
{
    public void Configure(EntityTypeBuilder<ExportJob> builder)
    {
        builder.ToTable("export_jobs");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Module).IsRequired().HasMaxLength(100);
        builder.Property(e => e.EntityType).IsRequired().HasMaxLength(100);
        builder.Property(e => e.ExportFormat).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.FilterCriteria).HasColumnType("text");
        builder.Property(e => e.FileName).HasMaxLength(500);
        builder.Property(e => e.FileStoragePath).HasMaxLength(1000);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(e => new { e.OrganizationId, e.Status })
            .HasDatabaseName("ix_export_jobs_org_status");
    }
}
