using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Participants.Domain.Entities;

namespace NGO.PMS.Participants.Infrastructure.Persistence.Configurations;

public class GraduationDecisionConfiguration : IEntityTypeConfiguration<GraduationDecision>
{
    public void Configure(EntityTypeBuilder<GraduationDecision> builder)
    {
        builder.ToTable("graduation_decisions");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.RequiredMetPercentage).HasPrecision(5, 2);
        builder.Property(e => e.Notes).HasMaxLength(2000);
        builder.Property(e => e.RejectionReason).HasMaxLength(2000);
        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => e.ParticipantId);
        builder.HasIndex(e => e.ProjectId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => new { e.ParticipantId, e.ProjectId });
    }
}
