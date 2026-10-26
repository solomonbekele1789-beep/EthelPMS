using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Settings.Domain.Entities;
using NGO.PMS.Settings.Domain.Enums;

namespace NGO.PMS.Settings.Infrastructure.Persistence.Configurations;

public class SystemSettingConfiguration : IEntityTypeConfiguration<SystemSetting>
{
    public void Configure(EntityTypeBuilder<SystemSetting> builder)
    {
        builder.ToTable("system_settings");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.SettingKey)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.SettingValue)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(e => e.DataType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.Category)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.HasIndex(e => e.SettingKey)
            .IsUnique()
            .HasDatabaseName("uq_system_settings_key");
    }
}
