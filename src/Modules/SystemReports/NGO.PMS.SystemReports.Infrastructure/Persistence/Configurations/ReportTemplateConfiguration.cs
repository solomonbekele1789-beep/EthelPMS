using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.SystemReports.Domain.Entities;

namespace NGO.PMS.SystemReports.Infrastructure.Persistence.Configurations;

public class ReportTemplateConfiguration : IEntityTypeConfiguration<ReportTemplate>
{
    public void Configure(EntityTypeBuilder<ReportTemplate> builder)
    {
        builder.ToTable("report_templates");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).IsRequired().HasMaxLength(300);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.Module).IsRequired().HasMaxLength(100);
        builder.Property(e => e.ReportFormat).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.QueryDefinition).HasColumnType("text").IsRequired();
        builder.Property(e => e.TemplateContent).HasColumnType("text");

        builder.Property(e => e.OrganizationId).IsRequired();

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasIndex(e => new { e.OrganizationId, e.Module });
    }
}
