using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Planning.Domain.Entities;

namespace NGO.PMS.Planning.Infrastructure.Persistence.Configurations;

public class PlanningConfigurationConfiguration : IEntityTypeConfiguration<PlanningConfiguration>
{
    public void Configure(EntityTypeBuilder<PlanningConfiguration> builder)
    {
        builder.ToTable("planning_configurations");
        builder.HasKey(e => e.Id);
        builder.HasIndex(e => e.OrganizationId).IsUnique().HasDatabaseName("uq_planning_config_org");
    }
}
