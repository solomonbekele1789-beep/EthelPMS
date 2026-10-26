using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Infrastructure.Persistence.Configurations;

public class ProjectInterventionAreaConfiguration : IEntityTypeConfiguration<ProjectInterventionArea>
{
    public void Configure(EntityTypeBuilder<ProjectInterventionArea> builder)
    {
        builder.ToTable("project_intervention_areas");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.BudgetAllocated).HasPrecision(18, 2);
        builder.Property(e => e.BudgetPercentage).HasPrecision(5, 2);

        builder.HasIndex(e => new { e.ProjectId, e.InterventionAreaId })
            .IsUnique().HasDatabaseName("uq_project_intervention_area");
    }
}
