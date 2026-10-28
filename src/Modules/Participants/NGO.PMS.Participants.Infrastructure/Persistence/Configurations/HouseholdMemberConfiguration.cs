using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Participants.Domain.Entities;

namespace NGO.PMS.Participants.Infrastructure.Persistence.Configurations;

public class HouseholdMemberConfiguration : IEntityTypeConfiguration<HouseholdMember>
{
    public void Configure(EntityTypeBuilder<HouseholdMember> builder)
    {
        builder.ToTable("household_members");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.HouseholdCode).IsRequired().HasMaxLength(50);
        builder.Property(e => e.RelationshipToHead).HasMaxLength(100);
        builder.Property(e => e.Address).HasMaxLength(500);
        builder.Property(e => e.Woreda).HasMaxLength(200);
        builder.Property(e => e.Kebele).HasMaxLength(200);
        builder.Property(e => e.Notes).HasMaxLength(2000);
        builder.Property(e => e.OrganizationId).IsRequired();

        // Indexes
        builder.HasIndex(e => e.HouseholdCode);
        builder.HasIndex(e => e.ParticipantId);
        builder.HasIndex(e => e.OrganizationId);
    }
}
