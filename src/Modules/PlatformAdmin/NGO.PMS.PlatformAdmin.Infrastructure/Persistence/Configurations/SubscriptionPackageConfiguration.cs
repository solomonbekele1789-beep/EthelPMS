using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.PlatformAdmin.Domain.Entities;

namespace NGO.PMS.PlatformAdmin.Infrastructure.Persistence.Configurations;

public class SubscriptionPackageConfiguration : IEntityTypeConfiguration<SubscriptionPackage>
{
    public void Configure(EntityTypeBuilder<SubscriptionPackage> builder)
    {
        builder.ToTable("subscription_packages");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).HasMaxLength(100).IsRequired();
        builder.Property(p => p.PriceMonthlyUsd).HasPrecision(10, 2);
        builder.Property(p => p.IncludedModules)
            .HasColumnType("text[]");

        builder.HasIndex(p => p.Name).IsUnique();
        builder.Ignore(p => p.DomainEvents);
    }
}
