using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Participants.Domain.Entities;

namespace NGO.PMS.Participants.Infrastructure.Persistence.Configurations;

public class ParticipantEnrollmentConfiguration : IEntityTypeConfiguration<ParticipantEnrollment>
{
    public void Configure(EntityTypeBuilder<ParticipantEnrollment> builder)
    {
        builder.ToTable("participant_enrollments");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.EnrollmentDate).IsRequired();
        builder.Property(e => e.ExitReason).HasMaxLength(1000);
        builder.Property(e => e.CohortName).HasMaxLength(200);
        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => e.ParticipantId);
        builder.HasIndex(e => e.ProjectId);
        builder.HasIndex(e => new { e.ParticipantId, e.ProjectId });
    }
}
