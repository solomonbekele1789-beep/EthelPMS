using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Infrastructure.Persistence.Configurations;

public class OutcomeConfiguration : IEntityTypeConfiguration<Outcome>
{
    public void Configure(EntityTypeBuilder<Outcome> builder)
    {
        builder.ToTable("outcomes");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Code).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Description).IsRequired().HasMaxLength(2000);
        builder.Property(e => e.Assumptions).HasMaxLength(2000);
        builder.Property(e => e.BaselineValue).HasPrecision(18, 4);
        builder.Property(e => e.TargetValue).HasPrecision(18, 4);
        builder.Property(e => e.DeletedBy).HasMaxLength(200);

        builder.HasIndex(e => e.ProjectId).HasDatabaseName("ix_outcomes_project");
        builder.HasIndex(e => e.OrganizationId).HasDatabaseName("ix_outcomes_organization");

        builder.HasMany(e => e.Outputs).WithOne(o => o.Outcome).HasForeignKey(o => o.OutcomeId);
        builder.HasMany(e => e.Indicators).WithOne(i => i.Outcome).HasForeignKey(i => i.OutcomeId);
    }
}
