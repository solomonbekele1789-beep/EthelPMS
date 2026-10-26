using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Reporting.Domain.Entities;

namespace NGO.PMS.Reporting.Infrastructure.Persistence.Configurations;

public class ReportApprovalConfiguration : IEntityTypeConfiguration<ReportApproval>
{
    public void Configure(EntityTypeBuilder<ReportApproval> builder)
    {
        builder.ToTable("report_approvals");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.UserId).IsRequired();
        builder.Property(e => e.ApprovalLevel);
        builder.Property(e => e.Action).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.Comments).HasMaxLength(2000);
        builder.Property(e => e.ActionDate).IsRequired();
        builder.Property(e => e.OrganizationId).IsRequired();

        builder.HasIndex(e => new { e.ReportId, e.ApprovalLevel });
    }
}
