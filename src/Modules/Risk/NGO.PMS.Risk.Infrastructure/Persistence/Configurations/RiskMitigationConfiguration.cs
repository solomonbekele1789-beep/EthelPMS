using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Risk.Domain.Entities;

namespace NGO.PMS.Risk.Infrastructure.Persistence.Configurations;

public class RiskMitigationConfiguration : IEntityTypeConfiguration<RiskMitigation>
{
    public void Configure(EntityTypeBuilder<RiskMitigation> builder)
    {
        builder.ToTable("risk_mitigations");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Action)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.ResponsiblePerson)
            .HasMaxLength(200);

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.EstimatedCost)
            .HasPrecision(18, 2);

        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        builder.HasIndex(e => e.RiskId);
    }
}
