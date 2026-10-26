using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.MEAL.Domain.Entities;

namespace NGO.PMS.MEAL.Infrastructure.Persistence.Configurations;

public class GesiAssessmentConfiguration : IEntityTypeConfiguration<GesiAssessment>
{
    public void Configure(EntityTypeBuilder<GesiAssessment> builder)
    {
        builder.ToTable("gesi_assessments");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.GesiAnalysis).HasColumnType("text");
        builder.Property(e => e.GenderMarkerJustification).HasMaxLength(4000);
        builder.Property(e => e.KeyFindings).HasColumnType("text");
        builder.Property(e => e.Recommendations).HasColumnType("text");
        builder.Property(e => e.AssessmentDate).IsRequired();

        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => e.ProjectId);
        builder.HasIndex(e => e.OrganizationId);
    }
}
