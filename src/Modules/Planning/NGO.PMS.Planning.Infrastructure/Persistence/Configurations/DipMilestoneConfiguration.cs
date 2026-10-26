using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Planning.Domain.Entities;

namespace NGO.PMS.Planning.Infrastructure.Persistence.Configurations;

public class DipMilestoneConfiguration : IEntityTypeConfiguration<DipMilestone>
{
    public void Configure(EntityTypeBuilder<DipMilestone> builder)
    {
        builder.ToTable("dip_milestones");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);
        builder.HasIndex(e => e.DipItemId).HasDatabaseName("ix_dip_milestones_dip_item");
    }
}
