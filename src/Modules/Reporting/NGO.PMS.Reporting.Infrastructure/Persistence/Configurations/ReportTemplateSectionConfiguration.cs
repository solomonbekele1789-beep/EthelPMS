using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Reporting.Domain.Entities;

namespace NGO.PMS.Reporting.Infrastructure.Persistence.Configurations;

public class ReportTemplateSectionConfiguration : IEntityTypeConfiguration<ReportTemplateSection>
{
    public void Configure(EntityTypeBuilder<ReportTemplateSection> builder)
    {
        builder.ToTable("report_template_sections");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);
        builder.Property(e => e.SectionType).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.SortOrder);
        builder.Property(e => e.IsRequired).HasDefaultValue(true);
        builder.Property(e => e.Instructions).HasMaxLength(2000);

        builder.HasIndex(e => e.ReportTemplateId);
    }
}
