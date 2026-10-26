using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Reporting.Domain.Entities;

namespace NGO.PMS.Reporting.Infrastructure.Persistence.Configurations;

public class ReportConfiguration : IEntityTypeConfiguration<Report>
{
    public void Configure(EntityTypeBuilder<Report> builder)
    {
        builder.ToTable("reports");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(500);
        builder.Property(e => e.ReportType).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);

        // Period
        builder.Property(e => e.PeriodStart).IsRequired();
        builder.Property(e => e.PeriodEnd).IsRequired();

        // Links
        builder.Property(e => e.ProjectId).IsRequired();

        // Financial
        builder.Property(e => e.PlannedBudget).HasPrecision(18, 2);
        builder.Property(e => e.ActualSpent).HasPrecision(18, 2);
        builder.Property(e => e.CumulativeYtdSpent).HasPrecision(18, 2);

        // Narrative
        builder.Property(e => e.ExecutiveSummary).HasMaxLength(4000);
        builder.Property(e => e.Challenges).HasMaxLength(4000);
        builder.Property(e => e.LessonsLearned).HasMaxLength(4000);
        builder.Property(e => e.Recommendations).HasMaxLength(4000);

        // Incident
        builder.Property(e => e.IncidentLocation).HasMaxLength(500);
        builder.Property(e => e.IncidentType).HasMaxLength(200);
        builder.Property(e => e.PeopleInvolved).HasMaxLength(2000);
        builder.Property(e => e.InjuriesDescription).HasMaxLength(2000);
        builder.Property(e => e.ImpactDescription).HasMaxLength(2000);

        // Approval
        builder.Property(e => e.RejectionReason).HasMaxLength(2000);

        // Tenant
        builder.Property(e => e.OrganizationId).IsRequired();

        // Computed — ignore
        builder.Ignore(e => e.Variance);
        builder.Ignore(e => e.BudgetUtilizationRate);

        builder.HasQueryFilter(e => !e.IsDeleted);

        // Relationships
        builder.HasMany(e => e.Sections)
            .WithOne(s => s.Report!)
            .HasForeignKey(s => s.ReportId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Approvals)
            .WithOne(a => a.Report!)
            .HasForeignKey(a => a.ReportId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Comments)
            .WithOne(c => c.Report!)
            .HasForeignKey(c => c.ReportId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.ReportTemplate)
            .WithMany()
            .HasForeignKey(e => e.ReportTemplateId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(e => e.OrganizationId);
        builder.HasIndex(e => new { e.ProjectId, e.ReportType });
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => new { e.ProjectId, e.PeriodStart, e.PeriodEnd });
    }
}
