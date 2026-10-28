using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Donors.Domain.Entities;

namespace NGO.PMS.Donors.Infrastructure.Persistence.Configurations;

public class DonorConfiguration : IEntityTypeConfiguration<Donor>
{
    public void Configure(EntityTypeBuilder<Donor> builder)
    {
        builder.ToTable("donors");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Acronym).HasMaxLength(50);
        builder.Property(e => e.Country).HasMaxLength(100);
        builder.Property(e => e.Website).HasMaxLength(500);
        builder.Property(e => e.Email).HasMaxLength(200);
        builder.Property(e => e.Phone).HasMaxLength(50);
        builder.Property(e => e.Address).HasMaxLength(500);
        builder.Property(e => e.Notes).HasMaxLength(2000);
        builder.Property(e => e.DefaultProcurementThreshold).HasPrecision(18, 2);
        builder.Property(e => e.DeletedBy).HasMaxLength(200);

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasMany(e => e.Contacts)
            .WithOne()
            .HasForeignKey(e => e.DonorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Grants)
            .WithOne()
            .HasForeignKey(e => e.DonorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Communications)
            .WithOne()
            .HasForeignKey(e => e.DonorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.Name)
            .HasDatabaseName("ix_donors_name");
    }
}
