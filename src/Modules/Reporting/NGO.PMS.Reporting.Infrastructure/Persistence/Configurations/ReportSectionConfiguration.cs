using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Reporting.Domain.Entities;

namespace NGO.PMS.Reporting.Infrastructure.Persistence.Configurations;

public class ReportSectionConfiguration : IEntityTypeConfiguration<ReportSection>
{
    public void Configure(EntityTypeBuilder<ReportSection> builder)
    {
        builder.ToTable("report_sections");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);
        builder.Property(e => e.SectionType).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.SortOrder);
        builder.Property(e => e.Content);
        builder.Property(e => e.OrganizationId).IsRequired();

        builder.HasMany(e => e.DataEntries)
            .WithOne(d => d.ReportSection!)
            .HasForeignKey(d => d.ReportSectionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.TemplateSection)
            .WithMany()
            .HasForeignKey(e => e.TemplateSectionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(e => e.ReportId);
    }
}
