using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Donors.Domain.Entities;

namespace NGO.PMS.Donors.Infrastructure.Persistence.Configurations;

public class DonorCommunicationConfiguration : IEntityTypeConfiguration<DonorCommunication>
{
    public void Configure(EntityTypeBuilder<DonorCommunication> builder)
    {
        builder.ToTable("donor_communications");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Type).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Subject).IsRequired().HasMaxLength(300);
        builder.Property(e => e.Content).HasMaxLength(4000);
        builder.Property(e => e.ContactedBy).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Outcome).HasMaxLength(1000);

        builder.HasIndex(e => new { e.DonorId, e.CommunicationDate })
            .HasDatabaseName("ix_donor_communications_donor_id_date");
    }
}
