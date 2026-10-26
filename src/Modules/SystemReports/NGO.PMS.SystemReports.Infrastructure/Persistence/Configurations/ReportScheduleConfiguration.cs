using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.SystemReports.Domain.Entities;

namespace NGO.PMS.SystemReports.Infrastructure.Persistence.Configurations;

public class ReportScheduleConfiguration : IEntityTypeConfiguration<ReportSchedule>
{
    public void Configure(EntityTypeBuilder<ReportSchedule> builder)
    {
        builder.ToTable("report_schedules");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).IsRequired().HasMaxLength(300);
        builder.Property(e => e.CronExpression).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Recipients).HasColumnType("text").IsRequired();
        builder.Property(e => e.Parameters).HasColumnType("text");
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);

        builder.Property(e => e.OrganizationId).IsRequired();

        builder.HasOne(e => e.ReportTemplate)
            .WithMany()
            .HasForeignKey(e => e.ReportTemplateId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.OrganizationId);
    }
}
