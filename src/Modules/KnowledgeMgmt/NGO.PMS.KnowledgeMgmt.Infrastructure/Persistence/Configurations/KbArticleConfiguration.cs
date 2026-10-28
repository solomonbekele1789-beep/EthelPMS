using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.KnowledgeMgmt.Domain.Entities;

namespace NGO.PMS.KnowledgeMgmt.Infrastructure.Persistence.Configurations;

public class KbArticleConfiguration : IEntityTypeConfiguration<KbArticle>
{
    public void Configure(EntityTypeBuilder<KbArticle> builder)
    {
        builder.ToTable("kb_articles");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(500);
        builder.Property(e => e.Content).IsRequired().HasColumnType("text");
        builder.Property(e => e.Summary).HasMaxLength(2000);
        builder.Property(e => e.Tags).HasMaxLength(1000);
        builder.Property(e => e.ArticleType).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.DeletedBy).HasMaxLength(200);

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasOne(e => e.Category)
            .WithMany()
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.Comments)
            .WithOne()
            .HasForeignKey(e => e.ArticleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.OrganizationId, e.CategoryId })
            .HasDatabaseName("ix_kb_articles_organization_id_category_id");

        builder.HasIndex(e => e.Status)
            .HasDatabaseName("ix_kb_articles_status");
    }
}
