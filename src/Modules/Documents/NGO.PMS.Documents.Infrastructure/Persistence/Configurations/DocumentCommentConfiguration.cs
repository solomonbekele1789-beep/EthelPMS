using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Documents.Domain.Entities;

namespace NGO.PMS.Documents.Infrastructure.Persistence.Configurations;

public class DocumentCommentConfiguration : IEntityTypeConfiguration<DocumentComment>
{
    public void Configure(EntityTypeBuilder<DocumentComment> builder)
    {
        builder.ToTable("document_comments");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Content)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(e => e.AuthorName)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasOne<DocumentComment>()
            .WithMany()
            .HasForeignKey(e => e.ParentCommentId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasIndex(e => e.DocumentId)
            .HasDatabaseName("ix_document_comments_document");
    }
}
