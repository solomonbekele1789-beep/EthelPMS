using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.PlatformAdmin.Domain.Entities;

namespace NGO.PMS.PlatformAdmin.Infrastructure.Persistence.Configurations;

public class ProvisioningLogConfiguration : IEntityTypeConfiguration<ProvisioningLog>
{
    public void Configure(EntityTypeBuilder<ProvisioningLog> builder)
    {
        builder.ToTable("provisioning_logs");
        builder.HasKey(l => l.Id);

        builder.Property(l => l.Step).HasMaxLength(100).IsRequired();
        builder.Property(l => l.Status).HasMaxLength(30).IsRequired();
        builder.Property(l => l.Message).HasMaxLength(2000);

        builder.HasOne(l => l.Tenant)
            .WithMany()
            .HasForeignKey(l => l.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(l => l.TenantId);
        builder.Ignore(l => l.DomainEvents);
    }
}
