using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Partnerships.Domain.Entities;

namespace NGO.PMS.Partnerships.Infrastructure.Persistence.Configurations;

public class DisbursementConfiguration : IEntityTypeConfiguration<Disbursement>
{
    public void Configure(EntityTypeBuilder<Disbursement> builder)
    {
        builder.ToTable("disbursements");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Amount).HasPrecision(18, 2);
        builder.Property(e => e.Currency).IsRequired().HasMaxLength(3);
        builder.Property(e => e.ReferenceNumber).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Purpose).IsRequired().HasMaxLength(1000);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne<SubGrantee>()
            .WithMany()
            .HasForeignKey(e => e.SubGranteeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.SubGranteeId)
            .HasDatabaseName("ix_disbursements_sub_grantee_id");

        builder.HasIndex(e => e.ReferenceNumber)
            .HasDatabaseName("ix_disbursements_reference_number");
    }
}
