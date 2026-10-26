using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Participants.Domain.Entities;

namespace NGO.PMS.Participants.Infrastructure.Persistence.Configurations;

public class GraduationAssessmentConfiguration : IEntityTypeConfiguration<GraduationAssessment>
{
    public void Configure(EntityTypeBuilder<GraduationAssessment> builder)
    {
        builder.ToTable("graduation_assessments");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Score).HasPrecision(5, 2);
        builder.Property(e => e.PillarStage).HasConversion<string>().IsRequired().HasMaxLength(10);
        builder.Property(e => e.AssessmentDate).IsRequired();
        builder.Property(e => e.Notes).HasMaxLength(2000);
        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => e.ParticipantId);
        builder.HasIndex(e => new { e.ParticipantId, e.BenchmarkId });
        builder.HasIndex(e => e.AssessmentDate);
    }
}
