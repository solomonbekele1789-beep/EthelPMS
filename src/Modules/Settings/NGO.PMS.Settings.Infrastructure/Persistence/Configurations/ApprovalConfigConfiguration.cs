using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Settings.Domain.Entities;

namespace NGO.PMS.Settings.Infrastructure.Persistence.Configurations;

public class ApprovalConfigConfiguration : IEntityTypeConfiguration<ApprovalConfig>
{
    public void Configure(EntityTypeBuilder<ApprovalConfig> builder)
    {
        builder.ToTable("approval_configs");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Module)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.EntityType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.AutoApproveBelow)
            .HasPrecision(18, 2);

        // ISoftDeletable
        builder.Property(e => e.IsDeleted).HasDefaultValue(false);
        builder.Property(e => e.DeletedAt);
        builder.Property(e => e.DeletedBy).HasMaxLength(256);

        builder.HasIndex(e => e.OrganizationId)
            .HasDatabaseName("ix_approval_configs_organization");

        builder.HasIndex(e => new { e.OrganizationId, e.Module, e.EntityType })
            .IsUnique()
            .HasDatabaseName("uq_approval_configs_org_module_entity");

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
