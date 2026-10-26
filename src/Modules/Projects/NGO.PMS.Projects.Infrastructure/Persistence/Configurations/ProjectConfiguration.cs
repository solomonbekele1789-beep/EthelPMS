using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.Projects.Domain.Enums;

namespace NGO.PMS.Projects.Infrastructure.Persistence.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("projects");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Description).HasMaxLength(4000);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.OperationalStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.TotalBudget).HasPrecision(18, 2);
        builder.Property(e => e.DonorName).HasMaxLength(200);
        builder.Property(e => e.Sector).HasMaxLength(100);
        builder.Property(e => e.ProgramPillar).HasMaxLength(100);
        builder.Property(e => e.Assumptions).HasMaxLength(4000);
        builder.Property(e => e.Risks).HasMaxLength(4000);
        builder.Property(e => e.MeansOfVerification).HasMaxLength(4000);
        builder.Property(e => e.Scope).HasMaxLength(4000);
        builder.Property(e => e.RejectionReason).HasMaxLength(2000);
        builder.Property(e => e.DeletedBy).HasMaxLength(200);

        builder.HasIndex(e => e.OrganizationId).HasDatabaseName("ix_projects_organization");
        builder.HasIndex(e => new { e.OrganizationId, e.Status }).HasDatabaseName("ix_projects_org_status");
        builder.HasIndex(e => new { e.Code, e.OrganizationId }).IsUnique().HasDatabaseName("uq_projects_code_org");

        builder.HasMany(e => e.Outcomes).WithOne(o => o.Project).HasForeignKey(o => o.ProjectId);
        builder.HasMany(e => e.TeamMembers).WithOne(m => m.Project).HasForeignKey(m => m.ProjectId);
        builder.HasMany(e => e.Revisions).WithOne(r => r.Project).HasForeignKey(r => r.ProjectId);
        builder.HasMany(e => e.InterventionAreas).WithOne(ia => ia.Project).HasForeignKey(ia => ia.ProjectId);
    }
}
