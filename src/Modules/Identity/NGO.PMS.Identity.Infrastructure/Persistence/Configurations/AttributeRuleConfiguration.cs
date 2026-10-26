using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Identity.Domain.Entities;

namespace NGO.PMS.Identity.Infrastructure.Persistence.Configurations;

public class AttributeRuleConfiguration : IEntityTypeConfiguration<AttributeRule>
{
    public void Configure(EntityTypeBuilder<AttributeRule> builder)
    {
        builder.ToTable("attribute_rules");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.AttributeName).HasMaxLength(100).IsRequired();
        builder.Property(a => a.Operator).HasMaxLength(20).HasDefaultValue("eq");
        builder.Property(a => a.AttributeValue).HasMaxLength(500).IsRequired();
        builder.Property(a => a.OrganizationId).IsRequired();

        builder.HasOne(a => a.Permission)
            .WithMany()
            .HasForeignKey(a => a.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(a => a.DomainEvents);
    }
}
