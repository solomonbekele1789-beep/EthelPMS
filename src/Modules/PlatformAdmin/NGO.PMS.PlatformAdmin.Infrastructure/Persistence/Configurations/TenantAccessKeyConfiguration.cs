using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.PlatformAdmin.Domain.Entities;

namespace NGO.PMS.PlatformAdmin.Infrastructure.Persistence.Configurations;

public class TenantAccessKeyConfiguration : IEntityTypeConfiguration<TenantAccessKey>
{
    public void Configure(EntityTypeBuilder<TenantAccessKey> builder)
    {
        builder.ToTable("tenant_access_keys");
        builder.HasKey(k => k.Id);

        builder.Property(k => k.KeyHash).HasMaxLength(512).IsRequired();
        builder.Property(k => k.Label).HasMaxLength(100).IsRequired();
        builder.Property(k => k.Scopes).HasColumnType("text[]");

        builder.HasIndex(k => k.KeyHash).IsUnique();
        builder.Ignore(k => k.IsRevoked);
        builder.Ignore(k => k.IsExpired);
        builder.Ignore(k => k.IsActive);
        builder.Ignore(k => k.DomainEvents);
    }
}
