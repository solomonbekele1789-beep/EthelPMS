using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.KnowledgeMgmt.Domain.Entities;

namespace NGO.PMS.KnowledgeMgmt.Infrastructure.Persistence.Configurations;

public class KbArticleCommentConfiguration : IEntityTypeConfiguration<KbArticleComment>
{
    public void Configure(EntityTypeBuilder<KbArticleComment> builder)
    {
        builder.ToTable("kb_article_comments");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Content).IsRequired().HasMaxLength(4000);

        builder.HasOne(e => e.ParentComment)
            .WithMany(e => e.Replies)
            .HasForeignKey(e => e.ParentCommentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.ArticleId)
            .HasDatabaseName("ix_kb_article_comments_article_id");
    }
}
