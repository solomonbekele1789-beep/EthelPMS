using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.ImportExport.Domain.Entities;

namespace NGO.PMS.ImportExport.Infrastructure.Persistence.Configurations;

public class ImportTemplateConfiguration : IEntityTypeConfiguration<ImportTemplate>
{
    public void Configure(EntityTypeBuilder<ImportTemplate> builder)
    {
        builder.ToTable("import_templates");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).IsRequired().HasMaxLength(300);
        builder.Property(e => e.Module).IsRequired().HasMaxLength(100);
        builder.Property(e => e.EntityType).IsRequired().HasMaxLength(100);
        builder.Property(e => e.FileFormat).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.ColumnMappings).IsRequired();
        builder.Property(e => e.ValidationRules);
        builder.Property(e => e.SampleFileUrl).HasMaxLength(1000);
        builder.Property(e => e.DeletedBy).HasMaxLength(200);

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasIndex(e => new { e.OrganizationId, e.Name, e.Module })
            .IsUnique()
            .HasDatabaseName("ix_import_templates_org_name_module");
    }
}
