using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Training.Domain.Entities;

namespace NGO.PMS.Training.Infrastructure.Persistence.Configurations;

public class TrainingSessionConfiguration : IEntityTypeConfiguration<TrainingSession>
{
    public void Configure(EntityTypeBuilder<TrainingSession> builder)
    {
        builder.ToTable("training_sessions");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.TrainingProgramId).IsRequired();
        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Venue).HasMaxLength(500);
        builder.Property(e => e.ScheduledDate).IsRequired();
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.Notes).HasMaxLength(2000);

        builder.HasMany(e => e.Participants)
            .WithOne()
            .HasForeignKey(p => p.TrainingSessionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.TrainingProgramId, e.ScheduledDate });
        builder.HasIndex(e => e.Status);
    }
}
