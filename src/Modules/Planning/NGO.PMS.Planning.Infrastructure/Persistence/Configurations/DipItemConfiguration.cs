using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Planning.Domain.Entities;

namespace NGO.PMS.Planning.Infrastructure.Persistence.Configurations;

public class DipItemConfiguration : IEntityTypeConfiguration<DipItem>
{
    public void Configure(EntityTypeBuilder<DipItem> builder)
    {
        builder.ToTable("dip_items");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.BudgetAllocated).HasPrecision(18, 2);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.DeletedBy).HasMaxLength(200);

        builder.HasIndex(e => e.ActivityId).HasDatabaseName("ix_dip_items_activity");
        builder.HasIndex(e => e.ProjectId).HasDatabaseName("ix_dip_items_project");
        builder.HasIndex(e => e.OrganizationId).HasDatabaseName("ix_dip_items_org");

        builder.HasMany(e => e.Milestones)
            .WithOne(m => m.DipItem)
            .HasForeignKey(m => m.DipItemId);
    }
}
