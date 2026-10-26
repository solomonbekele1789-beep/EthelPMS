using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Partnerships.Domain.Entities;

namespace NGO.PMS.Partnerships.Infrastructure.Persistence.Configurations;

public class PartnerComplianceConfiguration : IEntityTypeConfiguration<PartnerCompliance>
{
    public void Configure(EntityTypeBuilder<PartnerCompliance> builder)
    {
        builder.ToTable("partner_compliance");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.ComplianceType).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Findings).IsRequired().HasMaxLength(4000);
        builder.Property(e => e.Recommendations).HasMaxLength(4000);

        builder.HasOne<SubGrantee>()
            .WithMany()
            .HasForeignKey(e => e.SubGranteeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => new { e.OrganizationId, e.SubGranteeId })
            .HasDatabaseName("ix_partner_compliance_org_sub_grantee");

        builder.HasIndex(e => e.SubGranteeId)
            .HasDatabaseName("ix_partner_compliance_sub_grantee_id");
    }
}
