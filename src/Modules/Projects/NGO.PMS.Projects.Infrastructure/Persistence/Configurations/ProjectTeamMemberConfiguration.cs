using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Infrastructure.Persistence.Configurations;

public class ProjectTeamMemberConfiguration : IEntityTypeConfiguration<ProjectTeamMember>
{
    public void Configure(EntityTypeBuilder<ProjectTeamMember> builder)
    {
        builder.ToTable("project_team_members");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Role).IsRequired().HasMaxLength(100);
        builder.HasIndex(e => new { e.ProjectId, e.UserId }).HasDatabaseName("ix_team_project_user");
    }
}
