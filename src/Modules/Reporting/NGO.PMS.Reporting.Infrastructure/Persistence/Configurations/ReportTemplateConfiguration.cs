using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Reporting.Domain.Entities;

namespace NGO.PMS.Reporting.Infrastructure.Persistence.Configurations;

public class ReportTemplateConfiguration : IEntityTypeConfiguration<ReportTemplate>
{
    public void Configure(EntityTypeBuilder<ReportTemplate> builder)
    {
        builder.ToTable("report_templates");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Description).HasMaxLength(500);
        builder.Property(e => e.ReportType).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.IsActive).HasDefaultValue(true);
        builder.Property(e => e.RequiredApprovalLevels).HasDefaultValue(1);
        builder.Property(e => e.SubmissionDeadlineDays).HasDefaultValue(7);
        builder.Property(e => e.OrganizationId).IsRequired();

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasMany(e => e.Sections)
            .WithOne(s => s.ReportTemplate!)
            .HasForeignKey(s => s.ReportTemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.OrganizationId, e.ReportType });
    }
}
