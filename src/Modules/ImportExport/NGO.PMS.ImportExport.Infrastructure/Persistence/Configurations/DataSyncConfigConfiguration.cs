using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.ImportExport.Domain.Entities;

namespace NGO.PMS.ImportExport.Infrastructure.Persistence.Configurations;

public class DataSyncConfigConfiguration : IEntityTypeConfiguration<DataSyncConfig>
{
    public void Configure(EntityTypeBuilder<DataSyncConfig> builder)
    {
        builder.ToTable("data_sync_configs");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).IsRequired().HasMaxLength(300);
        builder.Property(e => e.SourceType).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.SourceUrl).IsRequired().HasMaxLength(1000);
        builder.Property(e => e.ApiKey).HasMaxLength(500);
        builder.Property(e => e.FormId).HasMaxLength(200);
        builder.Property(e => e.TargetModule).IsRequired().HasMaxLength(100);
        builder.Property(e => e.TargetEntityType).IsRequired().HasMaxLength(100);
        builder.Property(e => e.MappingConfig).IsRequired().HasColumnType("text");
        builder.Property(e => e.SyncFrequency).HasMaxLength(100);

        builder.HasIndex(e => e.Name)
            .HasDatabaseName("ix_data_sync_configs_name");
    }
}
