using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.PlatformAdmin.Domain.Entities;

namespace NGO.PMS.PlatformAdmin.Infrastructure.Persistence.Configurations;

public class PlatformTenantConfiguration : IEntityTypeConfiguration<PlatformTenant>
{
    public void Configure(EntityTypeBuilder<PlatformTenant> builder)
    {
        builder.ToTable("tenants");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Slug).HasMaxLength(100).IsRequired();
        builder.Property(t => t.AdminEmail).HasMaxLength(256).IsRequired();
        builder.Property(t => t.LogoUrl).HasMaxLength(500);
        builder.Property(t => t.PrimaryColor).HasMaxLength(20);
        builder.Property(t => t.Status).HasMaxLength(30).IsRequired();
        builder.Property(t => t.SuspensionReason).HasMaxLength(500);
        builder.Property(t => t.Timezone).HasMaxLength(50).HasDefaultValue("Africa/Addis_Ababa");

        builder.HasIndex(t => t.Slug).IsUnique();

        builder.HasOne(t => t.SubscriptionPackage)
            .WithMany()
            .HasForeignKey(t => t.SubscriptionPackageId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(t => t.TenantModules)
            .WithOne(m => m.Tenant)
            .HasForeignKey(m => m.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.AccessKeys)
            .WithOne(k => k.Tenant)
            .HasForeignKey(k => k.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(t => t.DomainEvents);
    }
}
