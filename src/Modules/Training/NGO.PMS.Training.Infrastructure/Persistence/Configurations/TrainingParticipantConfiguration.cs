using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Training.Domain.Entities;

namespace NGO.PMS.Training.Infrastructure.Persistence.Configurations;

public class TrainingParticipantConfiguration : IEntityTypeConfiguration<TrainingParticipant>
{
    public void Configure(EntityTypeBuilder<TrainingParticipant> builder)
    {
        builder.ToTable("training_participants");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.TrainingSessionId).IsRequired();
        builder.Property(e => e.FullName).IsRequired().HasMaxLength(600);
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.PreTestScore).HasPrecision(5, 2);
        builder.Property(e => e.PostTestScore).HasPrecision(5, 2);
        builder.Property(e => e.CertificateNumber).HasMaxLength(100);

        builder.HasIndex(e => new { e.TrainingSessionId, e.ParticipantId });
        builder.HasIndex(e => e.ParticipantId);
    }
}
