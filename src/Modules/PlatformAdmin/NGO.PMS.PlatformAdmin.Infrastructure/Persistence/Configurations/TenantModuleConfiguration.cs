using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.PlatformAdmin.Domain.Entities;

namespace NGO.PMS.PlatformAdmin.Infrastructure.Persistence.Configurations;

public class TenantModuleConfiguration : IEntityTypeConfiguration<TenantModule>
{
    public void Configure(EntityTypeBuilder<TenantModule> builder)
    {
        builder.ToTable("tenant_modules");
        builder.HasKey(m => m.Id);

        builder.Property(m => m.ModuleName).HasMaxLength(50).IsRequired();

        builder.HasIndex(m => new { m.TenantId, m.ModuleName }).IsUnique();
        builder.Ignore(m => m.DomainEvents);
    }
}
