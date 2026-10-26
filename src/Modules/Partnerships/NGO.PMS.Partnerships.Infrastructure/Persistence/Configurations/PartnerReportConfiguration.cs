using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Partnerships.Domain.Entities;

namespace NGO.PMS.Partnerships.Infrastructure.Persistence.Configurations;

public class PartnerReportConfiguration : IEntityTypeConfiguration<PartnerReport>
{
    public void Configure(EntityTypeBuilder<PartnerReport> builder)
    {
        builder.ToTable("partner_reports");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(500);
        builder.Property(e => e.ReportType).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Narrative).HasMaxLength(8000);
        builder.Property(e => e.ReviewComments).HasMaxLength(4000);

        builder.HasOne<SubGrantee>()
            .WithMany()
            .HasForeignKey(e => e.SubGranteeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.SubGranteeId)
            .HasDatabaseName("ix_partner_reports_sub_grantee_id");

        builder.HasIndex(e => new { e.SubGranteeId, e.ReportingPeriodEnd })
            .HasDatabaseName("ix_partner_reports_sub_grantee_period");
    }
}
