using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Risk.Domain.Entities;

namespace NGO.PMS.Risk.Infrastructure.Persistence.Configurations;

public class RiskAssessmentConfiguration : IEntityTypeConfiguration<RiskAssessment>
{
    public void Configure(EntityTypeBuilder<RiskAssessment> builder)
    {
        builder.ToTable("risk_assessments");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Likelihood)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Impact)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        builder.Property(e => e.AssessedBy)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Source)
            .HasMaxLength(50);

        builder.HasIndex(e => new { e.RiskId, e.AssessmentDate });
    }
}
