using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Documents.Domain.Entities;

namespace NGO.PMS.Documents.Infrastructure.Persistence.Configurations;

public class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.ToTable("documents");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.FileName)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.DisplayName)
            .HasMaxLength(300);

        builder.Property(e => e.Description)
            .HasMaxLength(4000);

        builder.Property(e => e.ContentType)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.Category)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.Tags)
            .HasMaxLength(1000);

        builder.Property(e => e.LinkedEntityType)
            .HasMaxLength(50);

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasMany(e => e.Versions)
            .WithOne()
            .HasForeignKey(e => e.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Comments)
            .WithOne()
            .HasForeignKey(e => e.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.FolderId, e.Status })
            .HasDatabaseName("ix_documents_folder_status");

        builder.HasIndex(e => new { e.FileName, e.DisplayName, e.Tags })
            .HasDatabaseName("ix_documents_search");
    }
}
