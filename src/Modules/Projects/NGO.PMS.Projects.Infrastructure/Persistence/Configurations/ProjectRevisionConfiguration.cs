using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Infrastructure.Persistence.Configurations;

public class ProjectRevisionConfiguration : IEntityTypeConfiguration<ProjectRevision>
{
    public void Configure(EntityTypeBuilder<ProjectRevision> builder)
    {
        builder.ToTable("project_revisions");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ChangeDescription).IsRequired().HasMaxLength(2000);
        builder.Property(e => e.Justification).HasMaxLength(2000);
        builder.Property(e => e.SnapshotJson).IsRequired();
        builder.HasIndex(e => e.ProjectId);
    }
}
