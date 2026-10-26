using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Training.Domain.Entities;

namespace NGO.PMS.Training.Infrastructure.Persistence.Configurations;

public class TrainingEvaluationConfiguration : IEntityTypeConfiguration<TrainingEvaluation>
{
    public void Configure(EntityTypeBuilder<TrainingEvaluation> builder)
    {
        builder.ToTable("training_evaluations");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.TrainingSessionId).IsRequired();
        builder.Property(e => e.OverallRating).HasPrecision(3, 1).IsRequired();
        builder.Property(e => e.Feedback).HasMaxLength(4000);
        builder.Property(e => e.Recommendations).HasMaxLength(4000);
        builder.Property(e => e.EvaluationDate).IsRequired();

        builder.HasIndex(e => e.TrainingSessionId);
    }
}
