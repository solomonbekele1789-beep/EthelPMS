using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.MEAL.Domain.Entities;

namespace NGO.PMS.MEAL.Infrastructure.Persistence.Configurations;

public class EvaluationFindingConfiguration : IEntityTypeConfiguration<EvaluationFinding>
{
    public void Configure(EntityTypeBuilder<EvaluationFinding> builder)
    {
        builder.ToTable("evaluation_findings");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Finding).IsRequired().HasMaxLength(4000);
        builder.Property(e => e.DacCriteria).HasConversion<string>().HasMaxLength(50);
        builder.Property(e => e.Recommendation).HasMaxLength(4000);
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);

        builder.Property(e => e.ManagementResponse).HasMaxLength(4000);
        builder.Property(e => e.VerificationNotes).HasMaxLength(2000);

        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => e.EvaluationId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => new { e.EvaluationId, e.SortOrder });
    }
}
