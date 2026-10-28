using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Partnerships.Domain.Entities;

namespace NGO.PMS.Partnerships.Infrastructure.Persistence.Configurations;

public class SubGranteeConfiguration : IEntityTypeConfiguration<SubGrantee>
{
    public void Configure(EntityTypeBuilder<SubGrantee> builder)
    {
        builder.ToTable("sub_grantees");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name).IsRequired().HasMaxLength(300);
        builder.Property(e => e.RegistrationNumber).HasMaxLength(100);
        builder.Property(e => e.ContactPerson).IsRequired().HasMaxLength(200);
        builder.Property(e => e.ContactEmail).IsRequired().HasMaxLength(200);
        builder.Property(e => e.ContactPhone).HasMaxLength(50);
        builder.Property(e => e.Address).HasMaxLength(500);
        builder.Property(e => e.Country).IsRequired().HasMaxLength(100);
        builder.Property(e => e.PartnerType).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.RiskRating).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Notes).HasMaxLength(4000);
        builder.Property(e => e.DeletedBy).HasMaxLength(200);

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasIndex(e => new { e.OrganizationId, e.RegistrationNumber })
            .IsUnique()
            .HasFilter("registration_number IS NOT NULL")
            .HasDatabaseName("uq_sub_grantees_org_registration_number");

        builder.HasIndex(e => e.OrganizationId)
            .HasDatabaseName("ix_sub_grantees_organization_id");
    }
}
