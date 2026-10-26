using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.MEAL.Domain.Entities;

namespace NGO.PMS.MEAL.Infrastructure.Persistence.Configurations;

public class EvaluationConfiguration : IEntityTypeConfiguration<Evaluation>
{
    public void Configure(EntityTypeBuilder<Evaluation> builder)
    {
        builder.ToTable("evaluations");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(500);
        builder.Property(e => e.Description).HasMaxLength(4000);
        builder.Property(e => e.EvaluationType).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.PrimaryDacCriteria).HasConversion<string>().HasMaxLength(50);

        builder.Property(e => e.PlannedStartDate).IsRequired();
        builder.Property(e => e.PlannedEndDate).IsRequired();
        builder.Property(e => e.Budget).HasPrecision(18, 2);

        builder.Property(e => e.ExternalEvaluator).HasMaxLength(500);
        builder.Property(e => e.Methodology).HasMaxLength(4000);
        builder.Property(e => e.Scope).HasMaxLength(4000);
        builder.Property(e => e.KeyQuestions).HasMaxLength(4000);

        builder.Property(e => e.OrganizationId).IsRequired();

        builder.HasQueryFilter(e => !e.IsDeleted);

        // Relationships
        builder.HasMany(e => e.Findings)
            .WithOne(f => f.Evaluation!)
            .HasForeignKey(f => f.EvaluationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => e.OrganizationId);
        builder.HasIndex(e => e.ProjectId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => new { e.ProjectId, e.EvaluationType });
    }
}
