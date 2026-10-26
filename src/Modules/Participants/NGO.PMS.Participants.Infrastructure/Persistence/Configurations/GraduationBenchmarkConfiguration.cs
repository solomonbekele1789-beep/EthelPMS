using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Participants.Domain.Entities;

namespace NGO.PMS.Participants.Infrastructure.Persistence.Configurations;

public class GraduationBenchmarkConfiguration : IEntityTypeConfiguration<GraduationBenchmark>
{
    public void Configure(EntityTypeBuilder<GraduationBenchmark> builder)
    {
        builder.ToTable("graduation_benchmarks");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).IsRequired().HasMaxLength(500);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.Domain).IsRequired().HasMaxLength(200);
        builder.Property(e => e.ThresholdP2).HasPrecision(5, 2);
        builder.Property(e => e.ThresholdP3).HasPrecision(5, 2);
        builder.Property(e => e.ThresholdP4).HasPrecision(5, 2);
        builder.Property(e => e.Weight).HasPrecision(5, 2);
        builder.Property(e => e.OrganizationId).IsRequired();

        // Relationships
        builder.HasMany(e => e.Assessments)
            .WithOne(a => a.Benchmark!)
            .HasForeignKey(a => a.BenchmarkId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => e.OrganizationId);
        builder.HasIndex(e => e.ProjectId);
        builder.HasIndex(e => new { e.OrganizationId, e.Domain });
    }
}
