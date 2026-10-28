using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Donors.Domain.Entities;

namespace NGO.PMS.Donors.Infrastructure.Persistence.Configurations;

public class GrantConfiguration : IEntityTypeConfiguration<Grant>
{
    public void Configure(EntityTypeBuilder<Grant> builder)
    {
        builder.ToTable("grants");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.GrantNumber).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Title).IsRequired().HasMaxLength(300);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.TotalAmount).HasPrecision(18, 2);
        builder.Property(e => e.CurrencyCode).IsRequired().HasMaxLength(3);
        builder.Property(e => e.ComplianceStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.CoFinancingAmount).HasPrecision(18, 2);
        builder.Property(e => e.CoFinancingPartner).HasMaxLength(200);

        builder.HasMany(e => e.Conditions)
            .WithOne()
            .HasForeignKey(e => e.GrantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Reports)
            .WithOne()
            .HasForeignKey(e => e.GrantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.GrantNumber)
            .IsUnique()
            .HasDatabaseName("uq_grants_grant_number");

        builder.HasIndex(e => new { e.DonorId, e.GrantNumber })
            .HasDatabaseName("ix_grants_donor_id_grant_number");
    }
}
