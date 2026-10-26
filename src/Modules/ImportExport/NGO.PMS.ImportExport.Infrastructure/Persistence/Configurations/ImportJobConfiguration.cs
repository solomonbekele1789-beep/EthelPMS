using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.ImportExport.Domain.Entities;

namespace NGO.PMS.ImportExport.Infrastructure.Persistence.Configurations;

public class ImportJobConfiguration : IEntityTypeConfiguration<ImportJob>
{
    public void Configure(EntityTypeBuilder<ImportJob> builder)
    {
        builder.ToTable("import_jobs");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.FileName).IsRequired().HasMaxLength(500);
        builder.Property(e => e.FileStoragePath).IsRequired().HasMaxLength(1000);
        builder.Property(e => e.Module).IsRequired().HasMaxLength(100);
        builder.Property(e => e.EntityType).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.ErrorLog).HasColumnType("text");

        builder.HasOne<ImportTemplate>()
            .WithMany()
            .HasForeignKey(e => e.ImportTemplateId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(e => new { e.OrganizationId, e.Status })
            .HasDatabaseName("ix_import_jobs_org_status");
    }
}
