using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Identity.Infrastructure.Persistence.Configurations;

public class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.ToTable("outbox_messages");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.EventType).HasMaxLength(500).IsRequired();
        builder.Property(o => o.Payload).IsRequired();
        builder.Property(o => o.Error).HasMaxLength(2000);

        builder.HasIndex(o => o.ProcessedAt)
            .HasFilter("processed_at IS NULL");
    }
}
