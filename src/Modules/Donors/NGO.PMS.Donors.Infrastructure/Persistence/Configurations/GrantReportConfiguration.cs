using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Donors.Domain.Entities;

namespace NGO.PMS.Donors.Infrastructure.Persistence.Configurations;

public class GrantReportConfiguration : IEntityTypeConfiguration<GrantReport>
{
    public void Configure(EntityTypeBuilder<GrantReport> builder)
    {
        builder.ToTable("grant_reports");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);
        builder.Property(e => e.ReportType).IsRequired().HasMaxLength(50);
        builder.Property(e => e.FileUrl).HasMaxLength(1000);
        builder.Property(e => e.Notes).HasMaxLength(2000);

        builder.HasIndex(e => new { e.GrantId, e.DueDate })
            .HasDatabaseName("ix_grant_reports_grant_id_due_date");
    }
}
