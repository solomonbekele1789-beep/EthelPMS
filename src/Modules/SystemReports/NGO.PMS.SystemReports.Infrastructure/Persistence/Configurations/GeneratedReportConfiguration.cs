using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.SystemReports.Domain.Entities;

namespace NGO.PMS.SystemReports.Infrastructure.Persistence.Configurations;

public class GeneratedReportConfiguration : IEntityTypeConfiguration<GeneratedReport>
{
    public void Configure(EntityTypeBuilder<GeneratedReport> builder)
    {
        builder.ToTable("generated_reports");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.FileName).IsRequired().HasMaxLength(500);
        builder.Property(e => e.StoragePath).HasColumnType("text").IsRequired();
        builder.Property(e => e.ReportFormat).HasConversion<string>().IsRequired().HasMaxLength(50);

        builder.Property(e => e.OrganizationId).IsRequired();

        builder.HasOne(e => e.ReportTemplate)
            .WithMany()
            .HasForeignKey(e => e.ReportTemplateId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Schedule)
            .WithMany()
            .HasForeignKey(e => e.ScheduleId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(e => e.OrganizationId);
    }
}
