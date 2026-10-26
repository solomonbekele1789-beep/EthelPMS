using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Settings.Domain.Entities;
using NGO.PMS.Settings.Domain.Enums;

namespace NGO.PMS.Settings.Infrastructure.Persistence.Configurations;

public class OrgSettingConfiguration : IEntityTypeConfiguration<OrgSetting>
{
    public void Configure(EntityTypeBuilder<OrgSetting> builder)
    {
        builder.ToTable("org_settings");

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

        builder.Property(e => e.Module)
            .HasMaxLength(100);

        builder.Property(e => e.Category)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        // ISoftDeletable
        builder.Property(e => e.IsDeleted).HasDefaultValue(false);
        builder.Property(e => e.DeletedAt);
        builder.Property(e => e.DeletedBy).HasMaxLength(256);

        builder.HasIndex(e => e.OrganizationId)
            .HasDatabaseName("ix_org_settings_organization");

        builder.HasIndex(e => new { e.OrganizationId, e.SettingKey })
            .IsUnique()
            .HasDatabaseName("uq_org_settings_org_key");

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
