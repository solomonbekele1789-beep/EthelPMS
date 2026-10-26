using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Reporting.Domain.Entities;

namespace NGO.PMS.Reporting.Infrastructure.Persistence.Configurations;

public class ReportDataEntryConfiguration : IEntityTypeConfiguration<ReportDataEntry>
{
    public void Configure(EntityTypeBuilder<ReportDataEntry> builder)
    {
        builder.ToTable("report_data_entries");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Key).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Label).HasMaxLength(200);
        builder.Property(e => e.StringValue).HasMaxLength(4000);
        builder.Property(e => e.NumericValue).HasPrecision(18, 4);
        builder.Property(e => e.SortOrder);
        builder.Property(e => e.OrganizationId).IsRequired();

        builder.HasIndex(e => e.ReportSectionId);
    }
}
