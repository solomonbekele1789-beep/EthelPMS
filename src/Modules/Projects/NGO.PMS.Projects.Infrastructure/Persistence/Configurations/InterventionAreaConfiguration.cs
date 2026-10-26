using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Infrastructure.Persistence.Configurations;

public class InterventionAreaConfiguration : IEntityTypeConfiguration<InterventionArea>
{
    public void Configure(EntityTypeBuilder<InterventionArea> builder)
    {
        builder.ToTable("intervention_areas");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Code).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.DeletedBy).HasMaxLength(200);

        builder.HasIndex(e => e.OrganizationId).HasDatabaseName("ix_intervention_areas_org");
        builder.HasIndex(e => e.ParentId).HasDatabaseName("ix_intervention_areas_parent");

        builder.HasOne(e => e.Parent).WithMany(e => e.Children).HasForeignKey(e => e.ParentId);
        builder.HasMany(e => e.ProjectAllocations).WithOne(pa => pa.InterventionArea).HasForeignKey(pa => pa.InterventionAreaId);
    }
}
