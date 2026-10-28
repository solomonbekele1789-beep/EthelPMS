using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Procurement.Domain.Entities;

namespace NGO.PMS.Procurement.Infrastructure.Persistence.Configurations;

public class ProcurementPlanConfiguration : IEntityTypeConfiguration<ProcurementPlan>
{
    public void Configure(EntityTypeBuilder<ProcurementPlan> builder)
    {
        builder.ToTable("procurement_plans");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);
        builder.Property(e => e.ReferenceNumber).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.Description).HasMaxLength(2000);

        builder.Property(e => e.OrganizationId).IsRequired();

        // Computed — ignore
        builder.Ignore(e => e.TotalEstimatedValue);

        // Relationships
        builder.HasMany(e => e.Items)
            .WithOne()
            .HasForeignKey(i => i.ProcurementPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => e.OrganizationId);
        builder.HasIndex(e => e.ProjectId);
        builder.HasIndex(e => e.ReferenceNumber).IsUnique();
        builder.HasIndex(e => e.Status);
    }
}
