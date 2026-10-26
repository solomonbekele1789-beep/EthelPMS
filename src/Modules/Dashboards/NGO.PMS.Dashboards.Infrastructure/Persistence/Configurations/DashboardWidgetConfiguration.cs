using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Dashboards.Domain.Entities;
using NGO.PMS.Dashboards.Domain.Enums;

namespace NGO.PMS.Dashboards.Infrastructure.Persistence.Configurations;

public class DashboardWidgetConfiguration : IEntityTypeConfiguration<DashboardWidget>
{
    public void Configure(EntityTypeBuilder<DashboardWidget> builder)
    {
        builder.ToTable("dashboard_widgets");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.WidgetType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.DataSourceModule)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.QueryDefinition)
            .HasColumnType("text");

        builder.Property(e => e.DisplayConfig)
            .HasColumnType("text");

        builder.HasIndex(e => e.DashboardConfigId)
            .HasDatabaseName("ix_dashboard_widgets_config");

        builder.HasIndex(e => e.OrganizationId)
            .HasDatabaseName("ix_dashboard_widgets_organization");
    }
}
