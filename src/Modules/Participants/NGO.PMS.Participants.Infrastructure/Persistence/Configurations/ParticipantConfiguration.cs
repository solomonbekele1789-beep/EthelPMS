using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Participants.Domain.Entities;

namespace NGO.PMS.Participants.Infrastructure.Persistence.Configurations;

public class ParticipantConfiguration : IEntityTypeConfiguration<Participant>
{
    public void Configure(EntityTypeBuilder<Participant> builder)
    {
        builder.ToTable("participants");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.FirstName).IsRequired().HasMaxLength(200);
        builder.Property(e => e.MiddleName).HasMaxLength(200);
        builder.Property(e => e.LastName).IsRequired().HasMaxLength(200);
        builder.Property(e => e.FullName).IsRequired().HasMaxLength(600);
        builder.Property(e => e.ParticipantCode).IsRequired().HasMaxLength(20);
        builder.Property(e => e.Gender).HasConversion<string>().IsRequired().HasMaxLength(20);
        builder.Property(e => e.Status).HasConversion<string>().IsRequired().HasMaxLength(50);
        builder.Property(e => e.IdNumber).HasMaxLength(100);
        builder.Property(e => e.Phone).HasMaxLength(50);
        builder.Property(e => e.Email).HasMaxLength(200);
        builder.Property(e => e.Region).HasMaxLength(200);
        builder.Property(e => e.Zone).HasMaxLength(200);
        builder.Property(e => e.Woreda).HasMaxLength(200);
        builder.Property(e => e.Kebele).HasMaxLength(200);
        builder.Property(e => e.Address).HasMaxLength(500);
        builder.Property(e => e.VulnerabilityScore).HasPrecision(8, 2);
        builder.Property(e => e.PhotoUrl).HasMaxLength(1000);
        builder.Property(e => e.OrganizationId).IsRequired();

        // Computed — ignore
        builder.Ignore(e => e.Age);

        builder.HasQueryFilter(e => !e.IsDeleted);

        // Relationships
        builder.HasMany(e => e.Enrollments)
            .WithOne(en => en.Participant!)
            .HasForeignKey(en => en.ParticipantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.GraduationAssessments)
            .WithOne(ga => ga.Participant!)
            .HasForeignKey(ga => ga.ParticipantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => e.OrganizationId);
        builder.HasIndex(e => e.ParticipantCode).IsUnique();
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => new { e.IdNumber, e.OrganizationId })
            .IsUnique()
            .HasFilter("id_number IS NOT NULL");
    }
}
