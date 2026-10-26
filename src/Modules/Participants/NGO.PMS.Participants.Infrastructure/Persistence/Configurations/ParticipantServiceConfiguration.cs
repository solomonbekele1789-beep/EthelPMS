using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Participants.Domain.Entities;

namespace NGO.PMS.Participants.Infrastructure.Persistence.Configurations;

public class ParticipantServiceConfiguration : IEntityTypeConfiguration<ParticipantService>
{
    public void Configure(EntityTypeBuilder<ParticipantService> builder)
    {
        builder.ToTable("participant_services");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.ServiceName).IsRequired().HasMaxLength(500);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.ServiceDate).IsRequired();
        builder.Property(e => e.Quantity).HasPrecision(18, 4);
        builder.Property(e => e.Unit).HasMaxLength(100);
        builder.Property(e => e.DeliveredByUserId).HasMaxLength(100);
        builder.Property(e => e.Notes).HasMaxLength(2000);
        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => e.ParticipantId);
        builder.HasIndex(e => e.ProjectId);
        builder.HasIndex(e => e.ServiceDate);
    }
}
