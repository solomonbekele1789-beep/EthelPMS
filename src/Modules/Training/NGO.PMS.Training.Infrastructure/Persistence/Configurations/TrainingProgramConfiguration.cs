using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Training.Domain.Entities;

namespace NGO.PMS.Training.Infrastructure.Persistence.Configurations;

public class TrainingProgramConfiguration : IEntityTypeConfiguration<TrainingProgram>
{
    public void Configure(EntityTypeBuilder<TrainingProgram> builder)
    {
        builder.ToTable("training_programs");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.Category).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.ProjectId).IsRequired();
        builder.Property(e => e.TotalSessions).IsRequired();
        builder.Property(e => e.IsActive).IsRequired();

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasMany(e => e.Sessions)
            .WithOne()
            .HasForeignKey(s => s.TrainingProgramId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.ProjectId);
        builder.HasIndex(e => e.Category);
    }
}
