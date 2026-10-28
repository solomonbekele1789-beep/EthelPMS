using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.KnowledgeMgmt.Domain.Entities;

namespace NGO.PMS.KnowledgeMgmt.Infrastructure.Persistence.Configurations;

public class KbCategoryConfiguration : IEntityTypeConfiguration<KbCategory>
{
    public void Configure(EntityTypeBuilder<KbCategory> builder)
    {
        builder.ToTable("kb_categories");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.DeletedBy).HasMaxLength(200);

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasOne(e => e.ParentCategory)
            .WithMany(e => e.ChildCategories)
            .HasForeignKey(e => e.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.OrganizationId)
            .HasDatabaseName("ix_kb_categories_organization_id");
    }
}
