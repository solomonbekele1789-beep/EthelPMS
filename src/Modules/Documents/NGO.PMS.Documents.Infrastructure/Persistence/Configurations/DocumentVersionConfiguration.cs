using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Documents.Domain.Entities;

namespace NGO.PMS.Documents.Infrastructure.Persistence.Configurations;

public class DocumentVersionConfiguration : IEntityTypeConfiguration<DocumentVersion>
{
    public void Configure(EntityTypeBuilder<DocumentVersion> builder)
    {
        builder.ToTable("document_versions");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.StorageUrl)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(e => e.ContentType)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.ChangeNotes)
            .HasMaxLength(2000);

        builder.Property(e => e.UploadedByName)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(e => new { e.DocumentId, e.VersionNumber })
            .IsDescending(false, true)
            .HasDatabaseName("ix_document_versions_doc_version");
    }
}
