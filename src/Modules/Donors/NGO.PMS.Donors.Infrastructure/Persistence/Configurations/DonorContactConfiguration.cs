using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Donors.Domain.Entities;

namespace NGO.PMS.Donors.Infrastructure.Persistence.Configurations;

public class DonorContactConfiguration : IEntityTypeConfiguration<DonorContact>
{
    public void Configure(EntityTypeBuilder<DonorContact> builder)
    {
        builder.ToTable("donor_contacts");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.FullName).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Title).HasMaxLength(100);
        builder.Property(e => e.Email).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Phone).HasMaxLength(50);

        builder.HasIndex(e => e.DonorId)
            .HasDatabaseName("ix_donor_contacts_donor_id");
    }
}
