using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Dashboards.Domain.Entities;

namespace NGO.PMS.Dashboards.Infrastructure.Persistence.Configurations;

public class SavedFilterConfiguration : IEntityTypeConfiguration<SavedFilter>
{
    public void Configure(EntityTypeBuilder<SavedFilter> builder)
    {
        builder.ToTable("saved_filters");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Module)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.FilterJson)
            .HasColumnType("text");

        builder.HasIndex(e => new { e.OrganizationId, e.UserId })
            .HasDatabaseName("ix_saved_filters_org_user");
    }
}
