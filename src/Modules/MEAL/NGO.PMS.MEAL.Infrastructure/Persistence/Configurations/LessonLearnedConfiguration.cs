using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.MEAL.Domain.Entities;

namespace NGO.PMS.MEAL.Infrastructure.Persistence.Configurations;

public class LessonLearnedConfiguration : IEntityTypeConfiguration<LessonLearned>
{
    public void Configure(EntityTypeBuilder<LessonLearned> builder)
    {
        builder.ToTable("lessons_learned");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(500);
        builder.Property(e => e.Description).IsRequired().HasMaxLength(4000);
        builder.Property(e => e.Category).HasMaxLength(200);
        builder.Property(e => e.Context).HasMaxLength(4000);
        builder.Property(e => e.ActionTaken).HasMaxLength(4000);
        builder.Property(e => e.Impact).HasMaxLength(4000);
        builder.Property(e => e.RecommendedAction).HasMaxLength(4000);

        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => e.ProjectId);
        builder.HasIndex(e => e.OrganizationId);
        builder.HasIndex(e => e.Category);
        builder.HasIndex(e => e.EvaluationId);
    }
}
