using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Risk.Domain.Entities;

namespace NGO.PMS.Risk.Infrastructure.Persistence.Configurations;

public class RiskCategoryConfiguration : IEntityTypeConfiguration<RiskCategory>
{
    public void Configure(EntityTypeBuilder<RiskCategory> builder)
    {
        builder.ToTable("risk_categories");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.Color)
            .HasMaxLength(20);

        builder.Property(e => e.OrganizationId)
            .IsRequired();

        builder.HasIndex(e => new { e.OrganizationId, e.Name })
            .IsUnique();

        builder.HasIndex(e => e.OrganizationId);
    }
}
