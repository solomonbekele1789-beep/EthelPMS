using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Documents.Domain.Entities;

namespace NGO.PMS.Documents.Infrastructure.Persistence.Configurations;

public class DocumentFolderConfiguration : IEntityTypeConfiguration<DocumentFolder>
{
    public void Configure(EntityTypeBuilder<DocumentFolder> builder)
    {
        builder.ToTable("document_folders");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasMany(e => e.SubFolders)
            .WithOne()
            .HasForeignKey(e => e.ParentFolderId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasMany(e => e.Documents)
            .WithOne()
            .HasForeignKey(e => e.FolderId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasIndex(e => e.ParentFolderId)
            .HasDatabaseName("ix_document_folders_parent");
    }
}
