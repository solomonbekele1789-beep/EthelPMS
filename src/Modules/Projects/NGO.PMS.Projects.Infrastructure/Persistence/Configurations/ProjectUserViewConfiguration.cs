using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Infrastructure.Persistence.Configurations;

public class ProjectUserViewConfiguration : IEntityTypeConfiguration<ProjectUserView>
{
    public void Configure(EntityTypeBuilder<ProjectUserView> builder)
    {
        builder.ToTable("users", "identity");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.FirstName).HasColumnName("first_name");
        builder.Property(e => e.LastName).HasColumnName("last_name");
        builder.Property(e => e.MiddleName).HasColumnName("middle_name");
        builder.Property(e => e.Email).HasColumnName("email");
        builder.Property(e => e.OrganizationId).HasColumnName("organization_id");
        builder.Property(e => e.IsActive).HasColumnName("is_active");
        builder.Property(e => e.IsDeleted).HasColumnName("is_deleted");
    }
}
